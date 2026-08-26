package com.gymbross.chatservice.service;

import com.Gym.GymCommonServices.entity.User;
import com.gymbross.chatservice.dto.ConversationSummary;
import com.gymbross.chatservice.dto.MessageRequest;
import com.gymbross.chatservice.dto.MessageResponse;
import com.gymbross.chatservice.model.ChatMessage;
import com.gymbross.chatservice.repository.ChatMessageRepository;
import com.gymbross.usermanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ChatServiceImpl implements ChatService {

    @Autowired
    private ChatMessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    public String resolveUsername(String identifier) {
        if (identifier == null || identifier.trim().isEmpty()) return identifier;
        String trimmed = identifier.trim();

        // 1. Check by UUID
        try {
            java.util.UUID uuid = java.util.UUID.fromString(trimmed);
            Optional<User> userOpt = userRepository.findById(uuid);
            if (userOpt.isPresent()) return userOpt.get().getUsername();
        } catch (IllegalArgumentException ignored) {}

        // 2. Check by Username, UserCode, Email
        return userRepository.findByUsername(trimmed)
                .or(() -> userRepository.findByUserCode(trimmed))
                .or(() -> userRepository.findTopByEmailIgnoreCase(trimmed))
                .map(User::getUsername)
                .orElse(trimmed);
    }

    @Override
    public List<String> getAllUserIdentifiers(String identifier) {
        if (identifier == null || identifier.trim().isEmpty()) return Collections.emptyList();
        String trimmed = identifier.trim();
        Set<String> ids = new LinkedHashSet<>();
        ids.add(trimmed);

        User user = null;
        try {
            java.util.UUID uuid = java.util.UUID.fromString(trimmed);
            user = userRepository.findById(uuid).orElse(null);
        } catch (IllegalArgumentException ignored) {}

        if (user == null) {
            user = userRepository.findByUsername(trimmed)
                    .or(() -> userRepository.findByUserCode(trimmed))
                    .or(() -> userRepository.findTopByEmailIgnoreCase(trimmed))
                    .orElse(null);
        }

        if (user != null) {
            if (user.getId() != null) ids.add(user.getId().toString());
            if (user.getUsername() != null) ids.add(user.getUsername());
            if (user.getUserCode() != null) ids.add(user.getUserCode());
            if (user.getEmail() != null) ids.add(user.getEmail());
        }

        return new ArrayList<>(ids);
    }

    @Override
    public MessageResponse sendMessage(MessageRequest request) {
        String sender = resolveUsername(request.getSenderUsername());
        String receiver = resolveUsername(request.getReceiverUsername());

        ChatMessage message = new ChatMessage();
        message.setSenderUsername(sender != null ? sender : request.getSenderUsername());
        message.setReceiverUsername(receiver != null ? receiver : request.getReceiverUsername());
        message.setContent(request.getContent());
        message.setRead(false);
        message.setTimestamp(LocalDateTime.now());

        ChatMessage savedMessage = messageRepository.save(message);
        return mapToResponse(savedMessage);
    }

    @Override
    public List<MessageResponse> getConversation(String user1, String user2) {
        List<String> u1Identifiers = getAllUserIdentifiers(user1);
        List<String> u2Identifiers = getAllUserIdentifiers(user2);

        Set<ChatMessage> matched = new LinkedHashSet<>();
        for (String id1 : u1Identifiers) {
            for (String id2 : u2Identifiers) {
                matched.addAll(messageRepository.findConversation(id1, id2));
            }
        }

        List<ChatMessage> list = new ArrayList<>(matched);
        list.sort(Comparator.comparing(ChatMessage::getTimestamp));
        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public List<MessageResponse> getUserHistory(String username) {
        List<String> ids = getAllUserIdentifiers(username);
        Set<ChatMessage> matched = new LinkedHashSet<>();
        for (String id : ids) {
            matched.addAll(messageRepository.findBySenderUsernameOrReceiverUsernameOrderByTimestampDesc(id, id));
        }

        List<ChatMessage> list = new ArrayList<>(matched);
        list.sort(Comparator.comparing(ChatMessage::getTimestamp).reversed());
        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public List<ConversationSummary> getConversations(String username) {
        List<String> userIds = getAllUserIdentifiers(username);
        Set<ChatMessage> allSet = new LinkedHashSet<>();
        for (String id : userIds) {
            allSet.addAll(messageRepository.findBySenderUsernameOrReceiverUsernameOrderByTimestampDesc(id, id));
        }

        List<ChatMessage> all = new ArrayList<>(allSet);
        all.sort(Comparator.comparing(ChatMessage::getTimestamp).reversed());

        String canonicalUser = resolveUsername(username);

        // Group by conversation partner
        Map<String, List<ChatMessage>> grouped = new LinkedHashMap<>();
        for (ChatMessage msg : all) {
            String partner = userIds.contains(msg.getSenderUsername())
                    ? msg.getReceiverUsername()
                    : msg.getSenderUsername();
            grouped.computeIfAbsent(partner, k -> new ArrayList<>()).add(msg);
        }

        return grouped.entrySet().stream().map(entry -> {
            String partner = entry.getKey();
            List<ChatMessage> msgs = entry.getValue();
            ChatMessage last = msgs.get(0);
            long unread = msgs.stream().filter(m -> userIds.contains(m.getReceiverUsername()) && !m.isRead()).count();
            return new ConversationSummary(partner, last.getContent(), last.getTimestamp(), unread);
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void markConversationRead(String readerUsername, String senderUsername) {
        List<String> readerIds = getAllUserIdentifiers(readerUsername);
        List<String> senderIds = getAllUserIdentifiers(senderUsername);

        List<ChatMessage> unread = new ArrayList<>();
        for (String rId : readerIds) {
            for (String sId : senderIds) {
                unread.addAll(messageRepository.findConversation(sId, rId)
                        .stream()
                        .filter(m -> rId.equals(m.getReceiverUsername()) && !m.isRead())
                        .collect(Collectors.toList()));
            }
        }

        LocalDateTime now = LocalDateTime.now();
        unread.forEach(m -> {
            m.setRead(true);
            m.setReadAt(now);
        });
        messageRepository.saveAll(unread);
    }

    @Override
    public List<com.gymbross.chatservice.dto.ChatContactDto> getChatContacts(java.security.Principal principal) {
        User currentUser = null;
        if (principal != null && principal.getName() != null) {
            String name = principal.getName().trim();
            currentUser = userRepository.findByUsername(name)
                    .or(() -> userRepository.findByUserCode(name))
                    .or(() -> userRepository.findTopByEmailIgnoreCase(name))
                    .orElse(null);
        }

        java.util.UUID currentOrgId = currentUser != null && currentUser.getOrganization() != null ? currentUser.getOrganization().getId() : null;
        List<User> targetUsers;
        if (currentOrgId != null) {
            targetUsers = userRepository.findByOrganizationId(currentOrgId);
        } else {
            targetUsers = userRepository.findAll();
        }

        java.util.UUID currentUserId = currentUser != null ? currentUser.getId() : null;
        List<String> currentUserIdentities = currentUser != null ? getAllUserIdentifiers(currentUser.getUsername()) : Collections.emptyList();

        List<com.gymbross.chatservice.dto.ChatContactDto> result = new ArrayList<>();
        for (User u : targetUsers) {
            if (Boolean.TRUE.equals(u.getIsDeleted())) continue;
            if (currentUserId != null && u.getId().equals(currentUserId)) continue;

            String role = u.getRole() != null ? u.getRole().toUpperCase() : "";
            boolean isStaffOrAdmin = role.contains("ADMIN") || role.contains("OWNER") ||
                                     role.contains("STAFF") || role.contains("MANAGER") ||
                                     role.contains("TRAINER") || role.contains("RECEPTIONIST") ||
                                     u.getStaffProfile() != null ||
                                     (u.getUserCode() != null && u.getUserCode().startsWith("STF-"));

            long unread = 0;
            if (!currentUserIdentities.isEmpty()) {
                List<String> partnerIdentities = getAllUserIdentifiers(u.getUsername());
                for (String pId : partnerIdentities) {
                    for (String cId : currentUserIdentities) {
                        unread += messageRepository.findConversation(pId, cId)
                                .stream()
                                .filter(m -> cId.equals(m.getReceiverUsername()) && !m.isRead())
                                .count();
                    }
                }
            }

            com.gymbross.chatservice.dto.ChatContactDto dto = com.gymbross.chatservice.dto.ChatContactDto.builder()
                    .id(u.getId().toString())
                    .name(u.getName() != null && !u.getName().isBlank() ? u.getName() : u.getUsername())
                    .username(u.getUsername())
                    .email(u.getEmail())
                    .userCode(u.getUserCode())
                    .role(u.getRole() != null ? u.getRole().replace("_", " ") : (isStaffOrAdmin ? "Staff" : "Member"))
                    .isStaff(isStaffOrAdmin)
                    .unreadCount(unread)
                    .build();

            result.add(dto);
        }

        return result;
    }

    @Override
    public MessageResponse editMessage(java.util.UUID messageId, String newContent, String requesterUsername) {
        ChatMessage message = messageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message not found with id: " + messageId));

        message.setContent(newContent);
        message.setEdited(true);
        ChatMessage saved = messageRepository.save(message);
        return mapToResponse(saved);
    }

    @Override
    public void deleteMessage(java.util.UUID messageId, String requesterUsername) {
        ChatMessage message = messageRepository.findById(messageId).orElse(null);
        if (message != null) {
            messageRepository.delete(message);
        }
    }

    private MessageResponse mapToResponse(ChatMessage message) {
        MessageResponse response = new MessageResponse();
        response.setId(message.getId());
        response.setSenderUsername(message.getSenderUsername());
        response.setReceiverUsername(message.getReceiverUsername());
        response.setContent(message.getContent());
        response.setTimestamp(message.getTimestamp());
        response.setRead(message.isRead());
        response.setEdited(message.isEdited());
        response.setReadAt(message.getReadAt());
        return response;
    }
}


package com.gymbross.chatservice.service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.Gym.GymCommonServices.entity.FitnessSession;
import com.Gym.GymCommonServices.entity.Role;
import com.Gym.GymCommonServices.entity.User;
import com.gymbross.chatservice.repository.FitnessSessionRepository;
import com.gymbross.chatservice.repository.SessionVoteRepository;
import com.gymbross.chatservice.repository.UserRepository;

@Service
public class FitnessSessionService {

	@Autowired
	private FitnessSessionRepository fitnessSessionRepository;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private NotificationService notificationService;

	@Autowired
	private SessionVoteRepository sessionVoteRepository;

	public FitnessSession createSession(FitnessSession session) {
		FitnessSession saved = fitnessSessionRepository.save(session);

		try {
			// Notify recipients
			List<Long> branchIds = Arrays.stream(session.getBranchIds().split(",")).map(String::trim)
					.map(Long::parseLong).collect(Collectors.toList());

			List<Role> roles = Arrays.stream(session.getRecipientRoles().split(",")).map(String::trim)
					.map(Role::valueOf).collect(Collectors.toList());

			System.out.println("DEBUG: Sending notifications to Branches: " + branchIds + ", Roles: " + roles);

			List<User> recipients = userRepository.findByBranchIdInAndRoleIn(branchIds, roles);
			System.out.println("DEBUG: Found " + recipients.size() + " potential recipients in DB.");

			if (recipients.isEmpty()) {
				System.out.println(
						"DEBUG: No recipients found for query. Please check if users exist with these roles and branch IDs.");
			}

			String content = String.format("New %s session scheduled at %s!", session.getSessionType(),
					session.getSessionTime());
			String actionLink = "/sessions/" + saved.getId();

			for (User user : recipients) {
				System.out.println(
						"DEBUG: Sending notification to Username: " + user.getUsername() + ", Role: " + user.getRole()
								+ ", Branch: " + (user.getBranch() != null ? user.getBranch().getId() : "NULL"));
				notificationService.createNotification(user.getUsername(), "SYSTEM", content, "SESSION", actionLink);
			}
		} catch (Exception e) {
			System.err.println("ERROR: Failed to search for recipients or send notifications: " + e.getMessage());
			e.printStackTrace();
		}

		return saved;
	}

	public List<FitnessSession> getAllSessions() {
		return fitnessSessionRepository.findAll();
	}

	public FitnessSession getSession(Long id) {
		return fitnessSessionRepository.findById(id).orElseThrow(() -> new RuntimeException("Session not found"));
	}

	public void vote(Long sessionId, String vote, String username) {
		// 1. Check if user already voted for this session
		if (sessionVoteRepository.findBySessionIdAndUsername(sessionId, username).isPresent()) {
			System.out.println("DEBUG: User " + username + " already voted for session " + sessionId);
			return; // Ignore duplicate vote
		}

		FitnessSession session = getSession(sessionId);

		// 2. Record the vote in session_votes table
		com.Gym.GymCommonServices.entity.SessionVote userVote = com.Gym.GymCommonServices.entity.SessionVote.builder()
				.sessionId(sessionId).username(username).voteType(vote.toUpperCase()).build();
		sessionVoteRepository.save(userVote);

		// 3. Increment the corresponding count in fitness_sessions table
		if ("IN".equalsIgnoreCase(vote)) {
			session.setInCount(session.getInCount() + 1);
		} else if ("OUT".equalsIgnoreCase(vote)) {
			session.setOutCount(session.getOutCount() + 1);
		}
		fitnessSessionRepository.save(session);
	}

	public FitnessSession updateSession(Long id, FitnessSession updatedSession) {
		FitnessSession existing = getSession(id);
		existing.setSessionType(updatedSession.getSessionType());
		existing.setSessionTime(updatedSession.getSessionTime());
		existing.setSessionPeriod(updatedSession.getSessionPeriod());
		existing.setDescription(updatedSession.getDescription());
		existing.setSessionDate(updatedSession.getSessionDate());
		existing.setRecipientRoles(updatedSession.getRecipientRoles());
		existing.setBranchIds(updatedSession.getBranchIds());
		existing.setPollEnabled(updatedSession.getPollEnabled());
		return fitnessSessionRepository.save(existing);
	}

	public String checkVoteStatus(Long sessionId, String username) {
		return sessionVoteRepository.findBySessionIdAndUsername(sessionId, username).map(vote -> vote.getVoteType())
				.orElse(null);
	}

	public void deleteSession(Long id) {
		if (fitnessSessionRepository.existsById(id)) {
			fitnessSessionRepository.deleteById(id);
		} else {
			throw new RuntimeException("Session not found with id: " + id);
		}
	}
}

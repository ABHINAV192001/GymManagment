package com.gymbross.usermanagement.service;

import com.gymbross.usermanagement.dto.NotificationBundleDto;

public interface NotificationBundleService {

    NotificationBundleDto getNotificationBundle(String username);

    NotificationBundleDto saveNotificationBundle(String username, NotificationBundleDto dto);

    void sendNotificationBundleEmail(String username, NotificationBundleDto dto);
}

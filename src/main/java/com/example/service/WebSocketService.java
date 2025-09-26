package com.example.service;

import com.example.model.City;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class WebSocketService {
    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void cityCreated(City city) {
        messagingTemplate.convertAndSend("/topic/cities", city);
    }

    public void cityDeleted(City city) {
        messagingTemplate.convertAndSend("/topic/cities", city);
    }

    public void cityUpdated(City city) {
        messagingTemplate.convertAndSend("/topic/cities", city);
    }
}

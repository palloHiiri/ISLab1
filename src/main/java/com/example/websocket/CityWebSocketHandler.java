package com.example.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.concurrent.CopyOnWriteArraySet;

@Component
public class CityWebSocketHandler extends TextWebSocketHandler {

    private final CopyOnWriteArraySet<WebSocketSession> sessions = new CopyOnWriteArraySet<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        sessions.add(session);
        System.out.println("WebSocket соединение установлено: " + session.getId());
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        System.err.println("WebSocket ошибка транспорта: " + exception.getMessage());
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        sessions.remove(session);
        System.out.println("WebSocket соединение закрыто: " + session.getId());
    }

    public void broadcastUpdate(String type, Object data) {
        if (sessions.isEmpty()) return;

        try {
            WebSocketMessage message = new WebSocketMessage(type, data);
            String jsonMessage = objectMapper.writeValueAsString(message);
            TextMessage textMessage = new TextMessage(jsonMessage);

            sessions.removeIf(session -> {
                try {
                    if (session.isOpen()) {
                        session.sendMessage(textMessage);
                        System.out.println("Отправлено сообщение WebSocket: " + jsonMessage);
                        return false;
                    }
                } catch (Exception e) {
                    System.err.println("Ошибка отправки WebSocket сообщения: " + e.getMessage());
                }
                return true;
            });
        } catch (Exception e) {
            System.err.println("Ошибка создания WebSocket сообщения: " + e.getMessage());
        }
    }

    public static class WebSocketMessage {
        private String type;
        private Object data;

        public WebSocketMessage() {}

        public WebSocketMessage(String type, Object data) {
            this.type = type;
            this.data = data;
        }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public Object getData() { return data; }
        public void setData(Object data) { this.data = data; }
    }
}

package com.example.banking.notification_service.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // Transaction events
    public static final String TRANSACTION_EXCHANGE = "transaction.events";
    public static final String TRANSACTION_NOTIFICATION_QUEUE = "transaction.completed.notification.queue";
    public static final String TRANSACTION_COMPLETED_ROUTING_KEY = "transaction.completed";

    // Loan events
    public static final String LOAN_EXCHANGE = "loan.events";
    public static final String LOAN_NOTIFICATION_QUEUE = "loan.status.notification.queue";
    public static final String LOAN_STATUS_CHANGED_ROUTING_KEY = "loan.status.changed";

    @Bean
    public TopicExchange transactionExchange() {
        return new TopicExchange(TRANSACTION_EXCHANGE);
    }

    @Bean
    public TopicExchange loanExchange() {
        return new TopicExchange(LOAN_EXCHANGE);
    }

    @Bean
    public Queue transactionNotificationQueue() {
        return QueueBuilder.durable(TRANSACTION_NOTIFICATION_QUEUE).build();
    }

    @Bean
    public Queue loanNotificationQueue() {
        return QueueBuilder.durable(LOAN_NOTIFICATION_QUEUE).build();
    }

    @Bean
    public Binding transactionNotificationBinding(Queue transactionNotificationQueue, TopicExchange transactionExchange) {
        return BindingBuilder.bind(transactionNotificationQueue).to(transactionExchange).with(TRANSACTION_COMPLETED_ROUTING_KEY);
    }

    @Bean
    public Binding loanNotificationBinding(Queue loanNotificationQueue, TopicExchange loanExchange) {
        return BindingBuilder.bind(loanNotificationQueue).to(loanExchange).with(LOAN_STATUS_CHANGED_ROUTING_KEY);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory, MessageConverter jsonMessageConverter) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter);
        return template;
    }
}

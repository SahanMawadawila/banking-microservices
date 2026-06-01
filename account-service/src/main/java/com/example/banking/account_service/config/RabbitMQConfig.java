package com.example.banking.account_service.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // User events (consume from identity-service)
    public static final String USER_EXCHANGE = "user.events";
    public static final String USER_REGISTERED_QUEUE = "user.registered.account.queue";
    public static final String USER_REGISTERED_ROUTING_KEY = "user.registered";

    // Transaction events (consume from transaction-service)
    public static final String TRANSACTION_EXCHANGE = "transaction.events";
    public static final String TRANSACTION_COMPLETED_QUEUE = "transaction.completed.account.queue";
    public static final String TRANSACTION_COMPLETED_ROUTING_KEY = "transaction.completed";

    // Loan events (consume from loan-service)
    public static final String LOAN_EXCHANGE = "loan.events";
    public static final String LOAN_DISBURSED_QUEUE = "loan.disbursed.account.queue";
    public static final String LOAN_DISBURSED_ROUTING_KEY = "loan.disbursed";

    @Bean
    public TopicExchange userExchange() {
        return new TopicExchange(USER_EXCHANGE);
    }

    @Bean
    public TopicExchange transactionExchange() {
        return new TopicExchange(TRANSACTION_EXCHANGE);
    }

    @Bean
    public TopicExchange loanExchange() {
        return new TopicExchange(LOAN_EXCHANGE);
    }

    @Bean
    public Queue userRegisteredAccountQueue() {
        return QueueBuilder.durable(USER_REGISTERED_QUEUE).build();
    }

    @Bean
    public Queue transactionCompletedAccountQueue() {
        return QueueBuilder.durable(TRANSACTION_COMPLETED_QUEUE).build();
    }

    @Bean
    public Queue loanDisbursedAccountQueue() {
        return QueueBuilder.durable(LOAN_DISBURSED_QUEUE).build();
    }

    @Bean
    public Binding userRegisteredBinding(Queue userRegisteredAccountQueue, TopicExchange userExchange) {
        return BindingBuilder.bind(userRegisteredAccountQueue).to(userExchange).with(USER_REGISTERED_ROUTING_KEY);
    }

    @Bean
    public Binding transactionCompletedBinding(Queue transactionCompletedAccountQueue, TopicExchange transactionExchange) {
        return BindingBuilder.bind(transactionCompletedAccountQueue).to(transactionExchange).with(TRANSACTION_COMPLETED_ROUTING_KEY);
    }

    @Bean
    public Binding loanDisbursedBinding(Queue loanDisbursedAccountQueue, TopicExchange loanExchange) {
        return BindingBuilder.bind(loanDisbursedAccountQueue).to(loanExchange).with(LOAN_DISBURSED_ROUTING_KEY);
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

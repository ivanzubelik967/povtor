package com.randomquote.rqm_back;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.nio.charset.StandardCharsets;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final QuoteRepository quoteRepository;
    private final DataSource dataSource;

    public DataInitializer(QuoteRepository quoteRepository, DataSource dataSource) {
        this.quoteRepository = quoteRepository;
        this.dataSource = dataSource;
    }

    @Override
    public void run(String... args) {
        long count = quoteRepository.count();
        if (count == 0) {
            log.info("Quote table is empty. Initializing database with seed data from data.sql...");
            try {
                ResourceDatabasePopulator populator = new ResourceDatabasePopulator(
                        false,
                        false,
                        StandardCharsets.UTF_8.name(),
                        new ClassPathResource("data.sql")
                );
                populator.execute(dataSource);
                long newCount = quoteRepository.count();
                log.info("Database initialized successfully. Total quotes loaded: {}", newCount);
            } catch (Exception e) {
                log.error("Failed to execute data.sql initialization script", e);
            }
        } else {
            log.info("Database already contains {} quotes. Skipping initial data seeding.", count);
        }
    }
}

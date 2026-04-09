package com.smartcampus.backend.config;

import com.smartcampus.backend.entities.Resource;
import com.smartcampus.backend.entities.User;
import com.smartcampus.backend.enums.ResourceStatus;
import com.smartcampus.backend.enums.ResourceType;
import com.smartcampus.backend.repository.ResourceRepository;
import com.smartcampus.backend.repository.UserRepository;
import com.smartcampus.backend.service.SequenceGeneratorService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class DataInitializer implements CommandLineRunner {

        @Autowired
        private ResourceRepository resourceRepository;

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private SequenceGeneratorService sequenceGeneratorService;

        @Override
        public void run(String... args) {
                if (userRepository.findByEmail("insightspark12@gmail.com").isEmpty()) {
                        User admin = new User();
                        admin.setEmail("insightspark12@gmail.com");
                        admin.setName("Admin User");
                        admin.setPassword("oauth2-no-password");
                        admin.setRole("ADMIN");
                        admin.setDisplayId(sequenceGeneratorService.generateDisplayId("ADMIN"));
                        userRepository.save(admin);
                        log.info("Seeded admin user: insightspark12@gmail.com with displayId: {}",
                                        admin.getDisplayId());
                }

                if (resourceRepository.count() == 0) {
                        log.info("Seeding sample resources...");

                        resourceRepository.save(Resource.builder()
                                        .name("Lecture Hall A")
                                        .type(ResourceType.LECTURE_HALL)
                                        .location("Block A, Ground Floor")
                                        .capacity(200)
                                        .status(ResourceStatus.AVAILABLE)
                                        .description("Main lecture hall with projector and audio system")
                                        .build());

                        resourceRepository.save(Resource.builder()
                                        .name("Computer Lab 1")
                                        .type(ResourceType.LAB)
                                        .location("Block B, First Floor")
                                        .capacity(40)
                                        .status(ResourceStatus.AVAILABLE)
                                        .description("Windows PCs with development tools installed")
                                        .build());

                        resourceRepository.save(Resource.builder()
                                        .name("Meeting Room 101")
                                        .type(ResourceType.MEETING_ROOM)
                                        .location("Admin Block, Floor 1")
                                        .capacity(12)
                                        .status(ResourceStatus.AVAILABLE)
                                        .description("Conference room with whiteboard and TV screen")
                                        .build());

                        resourceRepository.save(Resource.builder()
                                        .name("Sports Ground")
                                        .type(ResourceType.SPORTS)
                                        .location("Campus Grounds")
                                        .capacity(100)
                                        .status(ResourceStatus.AVAILABLE)
                                        .description("Multi-purpose outdoor sports area")
                                        .build());

                        resourceRepository.save(Resource.builder()
                                        .name("Library Study Room")
                                        .type(ResourceType.LIBRARY)
                                        .location("Library, Second Floor")
                                        .capacity(20)
                                        .status(ResourceStatus.MAINTENANCE)
                                        .description("Quiet study room — under maintenance")
                                        .build());

                        log.info("Seeded {} resources", resourceRepository.count());
                }
        }
}

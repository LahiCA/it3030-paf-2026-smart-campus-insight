package com.smartcampus.backend.service;

import com.smartcampus.backend.entities.DatabaseSequence;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class SequenceGeneratorService {

    @Autowired
    private MongoOperations mongoOperations;

    /**
     * Get and increment the next sequence number for a given key.
     * E.g. key = "admin_seq" → returns 1, 2, 3...
     */
    public long generateSequence(String seqName) {
        DatabaseSequence counter = mongoOperations.findAndModify(
                Query.query(Criteria.where("_id").is(seqName)),
                new Update().inc("seq", 1),
                FindAndModifyOptions.options().returnNew(true).upsert(true),
                DatabaseSequence.class);
        return counter != null ? counter.getSeq() : 1;
    }

    /**
     * Generate a display ID for a user based on their role.
     * ADMIN → ADM0001, ADM0002...
     * LECTURER → LEC0001, LEC0002...
     * TECHNICIAN → TEC0001, TEC0002...
     */
    public String generateDisplayId(String role) {
        String prefix;
        String seqName;

        switch (role.toUpperCase()) {
            case "ADMIN":
                prefix = "ADM";
                seqName = "admin_seq";
                break;
            case "LECTURER":
                prefix = "LEC";
                seqName = "lecturer_seq";
                break;
            case "TECHNICIAN":
                prefix = "TEC";
                seqName = "technician_seq";
                break;
            default:
                prefix = "USR";
                seqName = "user_seq";
                break;
        }

        long seq = generateSequence(seqName);
        return prefix + String.format("%04d", seq);
    }
}

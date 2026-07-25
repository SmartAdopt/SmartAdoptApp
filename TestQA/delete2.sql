DELETE FROM adopter WHERE user_id IN (SELECT user_id FROM "user" WHERE email LIKE 'test_k6_%');
DELETE FROM "user" WHERE email LIKE 'test_k6_%';
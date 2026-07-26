-- DevPath AI - User Profile Schema Updates

USE devpath_ai;

ALTER TABLE users ADD COLUMN profile_pic LONGTEXT DEFAULT NULL;

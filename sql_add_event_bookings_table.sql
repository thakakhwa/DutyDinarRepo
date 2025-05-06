-- this sql file makes a table in our database to remember who booked which events
-- it helps us keep track of all event bookings

-- CREATE TABLE means we are making a new table called event_bookings
-- this table will store all information about who books which events
CREATE TABLE `event_bookings` (
  -- id is a unique number for each booking, it goes up by 1 automatically
  `id` int(11) NOT NULL AUTO_INCREMENT,
  -- user_id tells us which user made the booking
  `user_id` int(11) NOT NULL,
  -- event_id tells us which event was booked
  `event_id` int(11) NOT NULL,
  -- quantity tells us how many tickets the user booked
  `quantity` int(11) NOT NULL,
  -- booking_date saves when the booking was made, it uses current time automatically
  `booking_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- PRIMARY KEY means we use id to find records in this table
  PRIMARY KEY (`id`),
  -- UNIQUE KEY means a user can only book the same event once
  UNIQUE KEY `user_event_unique` (`user_id`, `event_id`),
  -- KEY makes searching by event_id faster
  KEY `event_id` (`event_id`),
  -- CONSTRAINT makes sure we only book for real users
  -- if user is deleted, their bookings are also deleted (CASCADE)
  CONSTRAINT `event_bookings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  -- CONSTRAINT makes sure we only book for real events
  -- if event is deleted, all bookings for it are also deleted (CASCADE)
  CONSTRAINT `event_bookings_ibfk_2` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

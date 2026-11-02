"""Проверка правил создания записей: python -m unittest -v."""

import unittest

from main import Appoinment, appointments, create_appointment


class AppointmentTests(unittest.TestCase):
    def setUp(self):
        appointments.clear()

    def tearDown(self):
        appointments.clear()

    def test_two_valid_appointments_are_objects(self):
        first = create_appointment("Иванова А.А.", 1, 1, "10:00")
        second = create_appointment("Петрова А.А.", 1, 1, "11:00")
        self.assertIsInstance(first, Appoinment)
        self.assertIsInstance(second, Appoinment)
        self.assertEqual(first.id, 1)
        self.assertEqual(second.id, 2)
        self.assertEqual(first.master_id, 1)
        self.assertEqual(first.service_id, 1)
        self.assertEqual(
            [(record.client_name, record.time) for record in appointments],
            [("Иванова А.А.", "10:00"), ("Петрова А.А.", "11:00")],
        )

    def test_missing_fields_do_not_create_an_appointment(self):
        invalid_fields = [
            ("", 1, 1, "12:00"),
            ("   ", 1, 1, "12:00"),
            (None, 1, 1, "12:00"),
            ("Клиент", None, 1, "12:00"),
            ("Клиент", 1, None, "12:00"),
            ("Клиент", "", 1, "12:00"),
            ("Клиент", 1, "", "12:00"),
            ("Клиент", 1, 1, ""),
            ("Клиент", 1, 1, None),
        ]
        for fields in invalid_fields:
            with self.subTest(fields=fields):
                self.assertIsNone(create_appointment(*fields))
                self.assertEqual(len(appointments), 0)

    def test_unknown_master_or_service(self):
        for master_id, service_id in [(999, 1), (1, 999), (0, 1), (1, 0), (True, 1)]:
            with self.subTest(master_id=master_id, service_id=service_id):
                self.assertIsNone(create_appointment("Клиент", master_id, service_id, "12:00"))
                self.assertEqual(len(appointments), 0)

    def test_working_time_boundaries(self):
        for time in ["08:00", "08:01", "12:30", "19:59", "20:00"]:
            with self.subTest(time=time):
                appointments.clear()
                self.assertIsInstance(create_appointment("Клиент", 1, 1, time), Appoinment)
                self.assertEqual(len(appointments), 1)

    def test_outside_working_hours(self):
        for time in ["00:00", "07:59", "20:01", "23:59"]:
            with self.subTest(time=time):
                self.assertIsNone(create_appointment("Клиент", 1, 1, time))
                self.assertEqual(len(appointments), 0)

    def test_invalid_time_format(self):
        for time in ["8:00", "08:0", "24:00", "12:60", "12:00:00", " 12:00", "12:00\n", "abc", 1200]:
            with self.subTest(time=time):
                self.assertIsNone(create_appointment("Клиент", 1, 1, time))
                self.assertEqual(len(appointments), 0)

    def test_invalid_request_preserves_existing_records_and_ids(self):
        first = create_appointment("Иванова А.А.", 1, 1, "10:00")
        self.assertIsNone(create_appointment("", 1, 1, "11:00"))
        self.assertIsNone(create_appointment("Сидорова А.А.", 1, 1, "00:00"))
        self.assertEqual(appointments, [first])
        second = create_appointment("Петрова А.А.", 1, 1, "11:00")
        self.assertEqual(second.id, 2)


if __name__ == "__main__":
    unittest.main()

from faker import Faker
import random
from datetime import datetime
from .models import Robot

faker = Faker()

# Generate initial data for robots
def generate_robot_data(num_robots=100):
    return [
        Robot(
            id=f"robot-{i}",
            online=random.choice([True, False]),
            battery=random.randint(10, 100),
            cpu=random.randint(10, 90),
            ram=random.randint(100, 800),
            location=(faker.latitude(), faker.longitude()),
            last_updated=datetime.now().isoformat(),
        )
        for i in range(num_robots)
    ]

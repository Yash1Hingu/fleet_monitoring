import random
from datetime import datetime

def update_robot_data(robots):
    for robot in robots:
        # Simulate battery drain and data updates
        robot.battery = random.randint(0,100)
        robot.cpu = random.randint(10, 90)
        robot.ram = random.randint(100, 800)
        robot.online = robot.battery > 0  # Offline if battery is 0
        robot.location = (
            robot.location[0] + random.uniform(-0.01, 0.01),
            robot.location[1] + random.uniform(-0.01, 0.01),
        )
        robot.last_updated = datetime.now().isoformat()

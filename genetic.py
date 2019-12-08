from typing import Dict
from models.FacultyMember import *
import numpy as np

faculty_members = FacultyMember.members
projects = Project.projects


def populate(max_projects: int, max_members: int, pop_size):
    for i in range(pop_size):
        for index, project in enumerate(projects):
            first_examiner = np.random.randint(1, max_members)
            second_examiner = np.random.randint(1, max_members)



    for i, days in enumerate(schedules):
        for j, sessions in enumerate(days):
            for k, project in enumerate(sessions):
                supervisor = supervisors[i][j][k]

                first_examiner = first_examiners[i][j][k]

                second_examiner = second_examiners[i][j][k]

                schedules[i][j][k] = f'{project}{supervisor}{first_examiner}{second_examiner}'

    return schedules


def get_fitness(schedules):
    conflicts = 0

    for days in schedules:
        for sessions in days:
            for project_str in sessions:
                topic = projects[project_str[0]].get_topic()
                supervisor_prefs = faculty_members[project_str[1]].get_preferences()
                first_prefs = faculty_members[project_str[2]].get_preferences()
                second_prefs = faculty_members[project_str[3]].get_preferences()

                if topic not in supervisor_prefs:
                    conflicts += 1
                if topic not in first_prefs:
                    conflicts += 1
                if topic not in second_prefs:
                    conflicts += 1

    return 1 / (1 + conflicts)


def __crossover(x, y):
    length = np.random.randint(0, 4)


def __mutate():
    pass


def reproduce():
    pass

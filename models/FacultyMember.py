from typing import List, Union
import csv

NUM_DAYS = 2
NUM_SLOTS = 7

faculty_members = {}
projects = {}
sessions = {}
rooms = []


class FacultyMember:
    __count = 0

    def __init__(self, name: str, preferences: List[str]):
        self.__mid = str(FacultyMember.__count + 1)
        self.__name = name
        self.__preferences = preferences
        FacultyMember.__count += 1
        faculty_members[self.__mid] = self

    def get_count(self):
        return self.__count

    def get_mid(self):
        return self.__mid

    def get_name(self):
        return self.__name

    def get_preferences(self):
        return self.__preferences

    def add_preferences(self, preference: Union[str, List[str]]):
        if preference is str:
            self.__preferences.append(preference)
        elif preference is List[str]:
            self.__preferences = self.__preferences + preference

    def __str__(self) -> str:
        return f'{self.__mid}: {self.__name}'

    def __repr__(self) -> str:
        return f'{self.__mid}: {self.__name}'


class Project:
    __count = 0

    def __init__(self, name: str, topics: List[str], supervisor: FacultyMember, students: List[str]):
        self.__pid = str(Project.__count + 1)
        self.__name = name
        self.__topics = topics
        self.__students = students
        self.__supervisor = supervisor
        Project.__count += 1
        projects[self.__pid] = self

    def get_count(self):
        return self.__count

    def get_pid(self):
        return self.__pid

    def get_name(self):
        return self.__name

    def get_topics(self):
        return self.__topics

    def get_students(self):
        return self.__students

    def get_supervisor(self) -> FacultyMember:
        return self.__supervisor

    def __str__(self) -> str:
        return f'{self.__pid}: {self.__name}'

    def __repr__(self) -> str:
        return f'{self.__pid}: {self.__name}'


class Session:
    __count = 0

    def __init__(self, project: Project, examiners: List[FacultyMember], room: str, day: int, time: int):
        self.__sid = str(Session.__count + 1)
        self.__project = project
        self.__examiners = examiners
        self.__room = room
        self.__day = day
        self.__time = time
        Session.__count += 1
        sessions[self.__sid] = self

    def get_count(self):
        return self.__count

    def get_sid(self):
        return self.__sid

    def get_project(self) -> Project:
        return self.__project

    def get_examiners(self) -> List[FacultyMember]:
        return self.__examiners

    def get_room(self):
        return self.__room

    def get_day(self):
        return self.__day

    def get_time(self):
        return self.__time

    def __str__(self) -> str:
        return f'{self.__sid}: Project: {self.__project}, Examiners: {self.__examiners}, Room:{self.__room}, ' \
               f'Day-(Time-Slot): {self.__day}-{self.__time}'

    def __repr__(self) -> str:
        return f'{self.__sid}: Project: {self.__project}, Examiners: {self.__examiners}, Room:{self.__room}, ' \
               f'Day-(Time-Slot): {self.__day}-{self.__time}'


def read_faculty_members():
    """
    Reads the available faculty members from faculty members.csv.
    """
    try:
        with open('./data/faculty-members.csv') as file:
            for faculty_member in csv.reader(file):
                FacultyMember(faculty_member[0], str.split(faculty_member[1][1:-1], ','))
    except IOError as error:
        print("I/O error({0})".format(error))
        exit()


def read_projects():
    """
    Reads the available projects from projects.csv.
    """
    try:
        with open('./data/projects.csv') as file:
            for project in csv.reader(file):
                Project(project[0], str.split(project[1][1:-1], ','), faculty_members[project[2]],
                        str.split(project[3][1:-1], ','))
    except IOError as error:
        print("I/O error({0})".format(error))
        exit()


def read_rooms():
    """
    Reads the available rooms from rooms.csv.
    """
    global rooms
    try:
        with open('./data/rooms.csv') as file:
            for rooms_row in csv.reader(file):
                for room in rooms_row:
                    rooms += [room]
    except IOError as error:
        print("I/O error({0})".format(error))
        exit()

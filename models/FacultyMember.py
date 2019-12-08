from typing import List, Union


class FacultyMember:

    members = {}
    __count = 0

    def __init__(self, name: str, preferences: List[str]):
        self.__mid = str(self.__count + 1)
        self.__name = name
        self.__preferences = preferences
        self.__count += 1
        self.members[self.__mid] = self

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


class Project:

    projects = {}
    __count = 0

    def __init__(self, topic: str, supervisor, students: List[str]):
        self.__pid = str(self.__count + 1)
        self.__topic = topic
        self.__students = students
        self.__supervisor = supervisor
        self.__count += 1
        self.projects[self.__pid] = self

    def get_count(self):
        return self.__count

    def get_pid(self):
        return self.__pid

    def get_topic(self):
        return self.__topic

    def get_students(self):
        return self.__students

    def get_supervisor(self):
        return self.__supervisor


class Session:
    def __init__(self):
        pass

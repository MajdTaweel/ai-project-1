import numpy as np
import json
import genetic
from models.FacultyMember import *

NUM_SLOTS = 5
NUM_DAYS = 2
POP_SIZE = 20

Project('AI', 'Aziz Qaroush', ['Majd Taweel', 'Majd Wasat'])
Project('Computer Networks', 'Iyad Tumar', ['Majd Kaseer', 'Majd Nos Nos'])
Project('DSP', 'Ashraf Rimawi', ['Majd Mesh Taweel', 'Majd Kteer Taweel'])
Project('Robotics', 'John', ['Majd is Tall', 'Glory the Tall'])
Project('Quantum Computing', 'Audrey', ['Shame the Troll', 'Tiny Tall'])

FacultyMember('Aziz Qaroush', ['AI', 'Computer Networks'])
FacultyMember('Jeremy Benjamen', ['Quantum Computing', 'AI'])
FacultyMember('George Brown', ['Computer Networks', 'DSP', 'AI'])
FacultyMember('Stanley Robin', ['Robotics', 'AI'])
FacultyMember('Cassy John', ['DSP', 'Robotics'])
FacultyMember('Lee Johns', ['Computer Networks', 'Quantum Computing'])
FacultyMember('Audrey Samuel', ['Quantum Computing', 'DSP', 'Robotics'])

iterations = 10e9
max_fitness = 0

population = genetic.populate(5, 7, 20)

# while iterations > 0:
#     new_population =

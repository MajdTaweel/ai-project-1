from models.FacultyMember import *
import numpy as np

# Initialization steps to get the required data stored in csv files.
read_faculty_members()
read_projects()
read_rooms()


def __generate_random_session(project: Project):
    """
    Generates a Session object for a given project with its other attributes being randomly generated.
    :param project:
    :return: Session object that has the input projects and random other attributes.
    """

    # Generate a random first examiner
    first_examiner = np.random.randint(1, len(faculty_members) + 1)
    # A supervisor cannot be an examiner for the same project, this
    # ensures to satisfy that constraint
    while faculty_members[str(first_examiner)] == project.get_supervisor():
        first_examiner = np.random.randint(1, len(faculty_members) + 1)

    # Generate a random second examiner
    second_examiner = np.random.randint(1, len(faculty_members) + 1)
    # A project must have two different examiners whose each are not
    # the supervisor for the same project, this ensure to satisfy
    # that constraint
    while second_examiner == first_examiner or faculty_members[str(second_examiner)] == project.get_supervisor():
        second_examiner = np.random.randint(1, len(faculty_members) + 1)

    # Generate random room, day and time slot for the project
    room = np.random.randint(0, len(rooms))
    day = np.random.randint(1, NUM_DAYS + 1)
    time = np.random.randint(1, NUM_SLOTS + 1)

    return Session(project, [faculty_members[str(first_examiner)], faculty_members[str(second_examiner)]], rooms[room],
                   day, time)


def populate(pop_size) -> List[List[Session]]:
    """
    Returns the first-gen population of schedules.
    :param pop_size: The desired population size.
    :return: A list of lists of randomly generated Session objects.
    """
    population: List[List[Session]] = []
    for i in range(pop_size):
        schedule: List[Session] = []
        for key in projects:
            session = __generate_random_session(projects[key])
            schedule += [session]
        population += [schedule]

    return population


def get_fitness(schedule: List[Session], disable_preferences=False, disable_range=False) -> float:
    """
    Returns the fitness of the input chromosome (schedule).
    :param schedule: Input schedule for fitness calculation.
    :param disable_preferences: Disable conflicts on examiners' preferences.
    :param disable_range: Disable conflicts on disallowed number of assigned projects.
    :return: Float of a maximum value of "1", that describes the fitness of the input schedule.
    """
    conflicts = 0

    examiners = []
    examiners_schedule = []
    assigned_rooms = []

    for session in schedule:

        project = session.get_project()
        topics = project.get_topics()

        first_examiner = session.get_examiners()[0]
        second_examiner = session.get_examiners()[1]

        if not disable_preferences:
            first_examiner_prefs = first_examiner.get_preferences()
            second_examiner_prefs = second_examiner.get_preferences()

            # To check if any of the project's topics is of the examiners' preferences
            first_examiner_mismatches = second_examiner_mismatches = 0
            for topic in topics:
                if topic not in first_examiner_prefs:
                    first_examiner_mismatches += 1
                if topic not in second_examiner_prefs:
                    second_examiner_mismatches += 1

            # For each one of the examiners, it is considered a conflict
            # if none of the topics is from their preferences
            if first_examiner_mismatches == len(topics):
                conflicts += 1
            if second_examiner_mismatches == len(topics):
                conflicts += 1

        examiners += [first_examiner, second_examiner]
        examiners_schedule += [
            [first_examiner, session.get_day(), session.get_time()],
            [second_examiner, session.get_day(), session.get_time()]
        ]
        assigned_rooms += [
            [session.get_room(), session.get_day(), session.get_time()]
        ]

    if not disable_range:
        for examiner in list(set(examiners)):
            assigned_projects = examiners.count(examiner)
            if not 3 <= assigned_projects <= 6:
                conflicts += 1

    assigned_slots_set = []
    [assigned_slots_set.append(assigned_slot) for assigned_slot in examiners_schedule if
     assigned_slot not in assigned_slots_set]
    for examiner_assigned_slot in assigned_slots_set:
        no_assigned_slots = examiners_schedule.count(examiner_assigned_slot)
        conflicts += no_assigned_slots - 1

    assigned_rooms_set = []
    [assigned_rooms_set.append(assigned_room) for assigned_room in assigned_rooms if
     assigned_room not in assigned_rooms_set]
    for assigned_room in assigned_rooms_set:
        no_room_assignments = assigned_rooms.count(assigned_room)
        conflicts += no_room_assignments - 1

    return 1 / (1 + conflicts)


def __select(population, iteration: int, disable_preferences=False, disable_range=False):
    """
    Returns two random selections for mating partners.
    :param population: The population from which the parents to mate are chosen.
    :param iteration: The iteration of the mating process.
    :param disable_preferences: Disable conflicts on examiners' preferences.
    :param disable_range: Disable conflicts on disallowed number of assigned projects.
    :return: The indices of two randomly selected chromosomes (schedules).
    """
    fitness_values = []

    for parent in population:
        fitness_values += [get_fitness(parent, disable_preferences, disable_range)]

    # TODO: Not certain if this is a good choice or not so check it
    # If it is the first iteration the most two fit parent are chosen
    # if iteration == 0:
    #     most_fit = fitness_values.index(max(fitness_values))
    #     fitness_values.pop(most_fit)
    #     second_most_fit = fitness_values.index(max(fitness_values))
    #     return most_fit, second_most_fit

    selection_pool = []
    fitness_sum = np.sum(fitness_values)
    for index, fitness in enumerate(fitness_values):
        probability = np.zeros(int(round((fitness / fitness_sum) * 100)), int)
        probability = np.where(probability == 0, index, index).astype(int)
        selection_pool = np.append(selection_pool, probability).astype(int)

    first_random_selection = np.random.randint(0, len(selection_pool))
    second_random_selection = np.random.randint(0, len(selection_pool))

    while second_random_selection == first_random_selection:
        second_random_selection = np.random.randint(0, len(selection_pool))

    return selection_pool[first_random_selection], selection_pool[second_random_selection]


def __reproduce(first_parent, second_parent):
    """
    Returns a child of the two input parents.
    :param first_parent: The first parent for mating.
    :param second_parent: The second parent for mating.
    :return: A new schedule that has a flavor of both parents' genes.
    """
    zygote = first_parent + second_parent
    np.random.shuffle(zygote)
    offspring = zygote[:len(first_parent)]
    offspring2 = zygote[len(first_parent):]

    return offspring, offspring2


def __mutate(chromosome):
    """
    Mutates an input chromosome (schedule).
    :param chromosome: Input child (schedule) to be mutated.
    """
    selection = np.random.randint(0, len(chromosome))
    gene = chromosome[selection]
    project = gene.get_project()
    mutated_gene = __generate_random_session(project)
    chromosome[selection] = mutated_gene


def get_max_min_fitness(population, disable_preferences=False, disable_range=False):
    """
    Returns the maximum value of fitness found in the input population.
    :param population: The input population for max fitness value calculation.
    :param disable_preferences: Disable conflicts on examiners' preferences.
    :param disable_range: Disable conflicts on disallowed number of assigned projects.
    :return: Max of all fitness values of the input population.
    """
    fitness_values = []

    for parent in population:
        fitness_values += [get_fitness(parent, disable_preferences, disable_range)]

    max_fitness = max(fitness_values)
    min_fitness = min(fitness_values)

    return max_fitness, fitness_values.index(max_fitness), min_fitness, fitness_values.index(min_fitness)


def get_max_min_avg_fitness(population, disable_preferences=False, disable_range=False):
    """
    Returns the maximum value of fitness found in the input population.
    :param population: The input population for max fitness value calculation.
    :param disable_preferences: Disable conflicts on examiners' preferences.
    :param disable_range: Disable conflicts on disallowed number of assigned projects.
    :return: Max of all fitness values of the input population.
    """
    fitness_values = []

    for parent in population:
        fitness_values += [get_fitness(parent, disable_preferences, disable_range)]

    max_fitness = max(fitness_values)
    min_fitness = min(fitness_values)
    avg_fitness = np.mean(fitness_values)

    return max_fitness, fitness_values.index(max_fitness), min_fitness, fitness_values.index(min_fitness), avg_fitness


def get_next_gen(population, disable_preferences=False, disable_range=False):
    """
    Returns the next-gen of the population.
    :param population: The previous-gen (current) population.
    :param disable_preferences: Disable conflicts on examiners' preferences.
    :param disable_range: Disable conflicts on disallowed number of assigned projects.
    :return: List of schedules of new randomly generated Session objects.
    """
    new_population = []
    for i in range(len(population) // 2):
        first_selection, second_selection = __select(population, i, disable_preferences, disable_range)

        offspring, offspring2 = __reproduce(population[first_selection], population[second_selection])

        new_population += [offspring, offspring2]

    length = len(new_population[0])
    for child in new_population:
        very_small_probability = np.random.random() < (1 / length)
        if very_small_probability:
            __mutate(child)

    return new_population

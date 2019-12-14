import genetic
import eel
import json


def generate_schedule_json(population, max_index, max_fitness):
    json_string = ''
    for session in population[max_index]:
        if json_string != '':
            json_string += ','

        students_str = ''
        for student in session.get_project().get_students():
            if students_str != '':
                students_str += ','
            students_str += f'"{student}"'

        json_string += f'{{' \
                       f'"project": {{' \
                       f'"name": "{session.get_project().get_name()}",' \
                       f'"supervisor": "{session.get_project().get_supervisor().get_name()}",' \
                       f'"students": [{students_str}]' \
                       f'}},' \
                       f'"day": {session.get_day()},' \
                       f'"time": {session.get_time()},' \
                       f'"room": "{session.get_room()}",' \
                       f'"examiners": [' \
                       f'"{session.get_examiners()[0].get_name()}",' \
                       f'"{session.get_examiners()[1].get_name()}"' \
                       f']}}'

    json_string = f'{{' \
                  f'"schedule": [{json_string}],' \
                  f'"numberOfConflicts": {int((1 / max_fitness) - 1)}' \
                  f'}}'

    print(json_string)

    return json_string


@eel.expose
def optimize_schedule(pop_size=20, iterations=2000, disable_preferences=False, disable_range=False):
    conflicts_disable = [disable_preferences, disable_range]
    population = genetic.populate(pop_size)
    max_fitness, max_index, min_fitness, min_index = genetic.get_max_min_fitness(population, conflicts_disable[0],
                                                                                 conflicts_disable[1])
    print(f'Iteration: 0\nMax Fitness: {max_fitness}\n************')

    for i in range(iterations):
        if max_fitness == 1:
            break

        # if iterations >= 1000:
        #     if i == int(iterations * 0.4):
        #         conflicts_disable[1] = True
        #         population = genetic.populate(pop_size)
        #
        #     if i == int(iterations * 0.75):
        #         conflicts_disable[0] = True
        #         population = genetic.populate(pop_size)

        population = genetic.get_next_gen(population, conflicts_disable[0], conflicts_disable[1])
        new_population = genetic.populate(2)
        for chromosome in new_population:
            if genetic.get_fitness(chromosome, conflicts_disable[0], conflicts_disable[1]) > min_fitness:
                population.pop(min_index)
                population += [chromosome]

        max_fitness, max_index, min_fitness, min_index = genetic.get_max_min_fitness(population, conflicts_disable[0],
                                                                                     conflicts_disable[1])
        print(f'Iteration: {i + 1}\nMax Fitness: {max_fitness}\n************')

    json_string = generate_schedule_json(population, max_index, max_fitness)

    return json_string


__population = []
__conflicts_disable = [False, False]
__iteration = 0
__fitness = {
    'max': {
        'value': 0,
        'index': 0
    },
    'min': {
        'value': 0,
        'index': 0
    },
    'avg': 0,
    'schedule': None,
    'numberOfConflicts': 0
}


@eel.expose
def populate(disable_preferences, disable_range, pop_size=20):
    global __population, __fitness, __iteration
    __population.clear()

    __population += genetic.populate(pop_size)
    __fitness['max']['value'], __fitness['max']['index'], __fitness['min']['value'], __fitness['min'][
        'index'], __fitness['avg'] = genetic.get_max_min_avg_fitness(__population, disable_preferences, disable_range)

    schedule = json.loads(generate_schedule_json(__population, __fitness['max']['index'], __fitness['max']['value']))
    __fitness['schedule'] = schedule['schedule']
    __fitness['numberOfConflicts'] = schedule['numberOfConflicts']

    print(f'Iteration: {__iteration}\nMax Fitness: {__fitness["max"]["value"]}\n************')
    __iteration += 1

    return json.dumps(__fitness)


@eel.expose
def get_next_gen(disable_preferences, disable_range):
    global __population, __fitness, __iteration
    new_population = genetic.get_next_gen(__population, disable_preferences, disable_range)
    __population.clear()
    __population += new_population
    new_population = genetic.populate(2)
    for chromosome in new_population:
        if genetic.get_fitness(chromosome, disable_preferences, disable_range) > __fitness['min']['value']:
            __population.pop(__fitness['min']['index'])
            __population += [chromosome]

    __fitness['max']['value'], __fitness['max']['index'], __fitness['min']['value'], __fitness['min'][
        'index'], __fitness['avg'] = genetic.get_max_min_avg_fitness(__population, disable_preferences, disable_range)
    print(f'Iteration: {__iteration}\nMax Fitness: {__fitness["max"]["value"]}\n************')

    schedule = json.loads(generate_schedule_json(__population, __fitness['max']['index'], __fitness['max']['value']))
    __fitness['schedule'] = schedule['schedule']
    __fitness['numberOfConflicts'] = schedule['numberOfConflicts']

    __iteration += 1

    return json.dumps(__fitness)


eel.init('dist')
eel.start('index.html', mode='electron')

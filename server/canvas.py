import requests

#API Key
#9957~e21BVu6knGUBYR7kLxHgq0o5HfdwtRKUJ4tSrMoEJ8aI2QwRIhdTDXJ2vC0lZ9VS
keyAPI = '9957~e21BVu6knGUBYR7kLxHgq0o5HfdwtRKUJ4tSrMoEJ8aI2QwRIhdTDXJ2vC0lZ9VS'

canvasAPI = requests.get(f"https://templeu.instructure.com/api/v1/courses?access_token={keyAPI}")
raw_data = canvasAPI.json()


courses = [{'id':d['id'],'name':d['name']} for d in raw_data if 
    'enrollment_term_id' in d and d['enrollment_term_id'] == raw_data[0]['enrollment_term_id']]
weightData = [[requests.get(
    f"https://templeu.instructure.com/api/v1/courses/{course['id']}/assignment_groups?access_token={keyAPI}").json()]
              for course in courses]
wdcopy = []
for layer1 in weightData:
    for layer2 in layer1:
        for screwball in layer2:
            wdcopy.append(screwball)
weightData = wdcopy

courseData = [[requests.get(
    f"https://templeu.instructure.com/api/v1/courses/{course['id']}/assignments?access_token={keyAPI}").json()] 
    for course in courses]

assignments = []
for layer1 in courseData:
    for layer2 in layer1:
        for assignment in layer2:
            assignment = {"name" : assignment['name'], "id" : assignment['id'], "due" : assignment['due_at'],
                                'course_id': assignment['course_id'],'weight' : (item := [d['group_weight'] 
                                for d in weightData if d['id'] == assignment['assignment_group_id']])}
            assignments.append(assignment)
gradeData = requests.get(f"https://templeu.instructure.com/api/v1/users/self/enrollments?access_token={keyAPI}").json() 

gradeData = [
    {'course_name': (val := next((d['name'] for d in courses if d['id'] == course['course_id']), None)),
     'course_id' : course['course_id'],
     'score' : course['grades']['current_score'],
    'assignments' : [d for d in assignments if d['course_id'] == course['course_id']]
     }for course in gradeData if course['course_id'] in [d['id'] for d in courses]]
print(gradeData)
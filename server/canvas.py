import requests

#API Key
#9957~e21BVu6knGUBYR7kLxHgq0o5HfdwtRKUJ4tSrMoEJ8aI2QwRIhdTDXJ2vC0lZ9VS
keyAPI = '9957~e21BVu6knGUBYR7kLxHgq0o5HfdwtRKUJ4tSrMoEJ8aI2QwRIhdTDXJ2vC0lZ9VS'

canvasAPI = requests.get(f"https://templeu.instructure.com/api/v1/courses?access_token={keyAPI}")
raw_data = canvasAPI.json()


courses = [d['id'] for d in raw_data if 'enrollment_term_id' in d and d['enrollment_term_id'] == raw_data[0]['enrollment_term_id']]


weightData = [[requests.get(
    f"https://templeu.instructure.com/api/v1/courses/{ID}/assignment_groups?access_token={keyAPI}").json()]
    for ID in courses]
weightData = weightData[0][0]

courseData = [[requests.get(
    f"https://templeu.instructure.com/api/v1/courses/{ID}/assignments?access_token={keyAPI}").json()] 
    for ID in courses]

assignments = []
for course in courseData:
    for assignmentGroup in course:
        a_course = []
        for assignment in assignmentGroup:
            assignments.append({"name" : assignment['name'], "id" : assignment['id'], "due" : assignment['due_at'],
                                'course_id': assignment['course_id'],'weight' : (item := [d['group_weight'] 
                                for d in weightData if d['id'] == assignment['assignment_group_id']])})
print(assignments)

gradeData = requests.get(f"https://templeu.instructure.com/api/v1/users/self/enrollments?access_token={keyAPI}").json() 
gradeData = [{'course_id' : course['course_id'], 'score':course['grades']['current_score']} for course in gradeData if course['course_id'] in courses]
print(gradeData)



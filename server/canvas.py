import requests
#API Key
#9957~e21BVu6knGUBYR7kLxHgq0o5HfdwtRKUJ4tSrMoEJ8aI2QwRIhdTDXJ2vC0lZ9VS

canvasAPI = requests.get("https://templeu.instructure.com/api/v1/courses?access_token=9957~e21BVu6knGUBYR7kLxHgq0o5HfdwtRKUJ4tSrMoEJ8aI2QwRIhdTDXJ2vC0lZ9VS")
raw_data = canvasAPI.json()


courses = [d['id'] for d in raw_data if 'enrollment_term_id' in d and d['enrollment_term_id'] == raw_data[0]['enrollment_term_id']]


courseData = [[requests.get(f"https://templeu.instructure.com/api/v1/courses/{ID}/assignments?access_token=9957~e21BVu6knGUBYR7kLxHgq0o5HfdwtRKUJ4tSrMoEJ8aI2QwRIhdTDXJ2vC0lZ9VS").json()] for ID in courses]
# print(courseData)
assignments = []
for course in courseData:
    for assignmentGroup in course:
        a_course = []
        for assignment in assignmentGroup:
            a_course.append((assignment['name'], assignment['due_at']))
        assignments.append(a_course)
# print(assignments)


gradeData = requests.get(f"https://templeu.instructure.com/api/v1/users/self/enrollments?access_token=9957~e21BVu6knGUBYR7kLxHgq0o5HfdwtRKUJ4tSrMoEJ8aI2QwRIhdTDXJ2vC0lZ9VS").json() 
#gradeData = requests.get(f"https://canvas.instructure.com/api/v1/users/self/courses?access_token=9957~e21BVu6knGUBYR7kLxHgq0o5HfdwtRKUJ4tSrMoEJ8aI2QwRIhdTDXJ2vC0lZ9VS").json()

gradeData = [[course['course_id']] for course in gradeData if course['course_id'] in courses]
print(gradeData)


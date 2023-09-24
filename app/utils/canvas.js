const axios = require('axios');

const keyAPI = '9957~e21BVu6knGUBYR7kLxHgq0o5HfdwtRKUJ4tSrMoEJ8aI2QwRIhdTDXJ2vC0lZ9VS';
const baseURL = 'https://templeu.instructure.com/api/v1/';

async function fetchData() {
    try {
        const response = await axios.get(`${baseURL}courses?access_token=${keyAPI}`);
        const raw_data = response.data;

        const courses = raw_data.filter(d => d.hasOwnProperty('enrollment_term_id') && d.enrollment_term_id === raw_data[0].enrollment_term_id)
                                .map(d => ({ id: d.id, name: d.name }));

        const weightDataPromises = courses.map(course => axios.get(`${baseURL}courses/${course.id}/assignment_groups?access_token=${keyAPI}`));
        let weightData = (await Promise.all(weightDataPromises)).map(resp => resp.data).flat();

        const courseDataPromises = courses.map(course => axios.get(`${baseURL}courses/${course.id}/assignments?access_token=${keyAPI}`));
        let courseData = (await Promise.all(courseDataPromises)).map(resp => resp.data).flat();

        const assignments = courseData.map(assignment => ({
            name: assignment.name,
            id: assignment.id,
            due: assignment.due_at,
            course_id: assignment.course_id,
            weight: weightData.filter(d => d.id == assignment.assignment_group_id).map(d => d.group_weight)
        }));

        const gradeDataResponse = await axios.get(`${baseURL}users/self/enrollments?access_token=${keyAPI}`);
        let gradeData = gradeDataResponse.data;

        gradeData = gradeData.filter(course => courses.map(d => d.id).includes(course.course_id))
                             .map(course => ({
                                 course_name: (courses.find(d => d.id === course.course_id) || {}).name || null,
                                 course_id: course.course_id,
                                 score: course.grades.current_score,
                                 assignments: assignments.filter(d => d.course_id === course.course_id)
                             }));

        console.log(gradeData);
    } catch (error) {
        console.error("Error fetching data: ", error);
    }
}


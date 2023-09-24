const axios = require('axios');

const keyAPI = '9957~e21BVu6knGUBYR7kLxHgq0o5HfdwtRKUJ4tSrMoEJ8aI2QwRIhdTDXJ2vC0lZ9VS';
const baseURL = 'https://templeu.instructure.com/api/v1/';

async function getCoursesWithId() {
    try {
        const response = await axios.get(`${baseURL}courses?access_token=${keyAPI}`);
        const raw_data = response.data;
        const courses = raw_data.filter(d => d.hasOwnProperty('enrollment_term_id') && d.enrollment_term_id === raw_data[0].enrollment_term_id)
                                .map(d => ({ id: d.id, name: d.name }));
        return courses
    } catch (error) {
        console.error("Error fetching courses: ", error);
        return JSON.stringify({ error: 'Error fetching courses.' });
    }
}

async function getCoursesList() {
    try {
        const response = await axios.get(`${baseURL}courses?access_token=${keyAPI}`);
        const raw_data = response.data;
        const courses = raw_data.filter(d => d.hasOwnProperty('enrollment_term_id') && d.enrollment_term_id === raw_data[0].enrollment_term_id)
                                .map(d => (d.name));
        return courses;
    } catch (error) {
        console.error("Error fetching courses: ", error);
        return JSON.stringify({ error: 'Error fetching courses.' });
    }
}

async function getCoursesUtil() {
    try {
        const response = await axios.get(`${baseURL}courses?access_token=${keyAPI}`);
        const raw_data = response.data;

        const courses = raw_data.filter(d => d.hasOwnProperty('enrollment_term_id') && d.enrollment_term_id === raw_data[0].enrollment_term_id)
                                .reduce((acc, course) => {
                                    acc[course.name] = course.id;
                                    return acc;
                                }, {});

        return courses;
    } catch (error) {
        console.error("Error fetching courses: ", error);
        return { error: 'Error fetching courses.' };
    }
}


async function getGrades() {
    try {

        const response = await axios.get(`${baseURL}courses?access_token=${keyAPI}`);
        const raw_data = response.data;
        const courses = raw_data.filter(d => d.hasOwnProperty('enrollment_term_id') && d.enrollment_term_id === raw_data[0].enrollment_term_id)
                                .map(d => (d.name));

        const gradeDataResponse = await axios.get(`${baseURL}users/self/enrollments?access_token=${keyAPI}`);
        let gradeData = gradeDataResponse.data;

        gradeData = gradeData.filter(course => courses.map(d => d.id).includes(course.course_id))
            .map(course => ({
                course_name: (courses.find(d => d.id === course.course_id) || {}).name || null,
                // course_id: course.course_id,
                score: course.grades.current_score,
                // assignments: assignments.filter(d => d.course_id === course.course_id)
            }));

        const gradesInfo = {
            "grades": gradeData,
        }
        return JSON.stringify(gradesInfo);
    } catch (error) {
        console.error("Error fetching weights: ", error);
        return JSON.stringify({ error: 'Error fetching weights.' });
    }
}

async function getAssignments(courseId) {
    try {

        const courseDictionary = await getCoursesUtil();

        // Fetch weightData for the specific courseId
        const weightDataResponse = await axios.get(`${baseURL}courses/${courseId}/assignment_groups?access_token=${keyAPI}`);
        const weightData = weightDataResponse.data;

        // Fetch courseData for the specific courseId
        const courseDataResponse = await axios.get(`${baseURL}courses/${courseId}/assignments?access_token=${keyAPI}`);
        const courseData = courseDataResponse.data;

        const assignments = courseData.map(assignment => ({
            name: assignment.name,
            due: assignment.due_at,
            weight: weightData.filter(d => d.id == assignment.assignment_group_id).map(d => d.group_weight)
        })).filter(assignment => assignment.due !== null)

        const assignmentInfo = {
            "course": courseDictionary[courseId],
            "assignments": assignments,
        };
        return JSON.stringify(assignmentInfo);
    } catch (error) {
        console.error("Error fetching assignments: ", error);
        return JSON.stringify({ error: 'Error fetching assignments.' });
    }
}

async function getCourses() {
    try {
        const response = await axios.get(`${baseURL}courses?access_token=${keyAPI}`);
        const raw_data = response.data;
        const courses = raw_data.filter(d => d.hasOwnProperty('enrollment_term_id') && d.enrollment_term_id === raw_data[0].enrollment_term_id)
                                .map(d => (d.name));

        const coursesInfo = {
            "courses": courses
        }
        
        return JSON.stringify(coursesInfo);
    } catch (error) {
        console.error("Error fetching courses: ", error);
        return JSON.stringify({ error: 'Error fetching courses.' });
    }
}

module.exports = {
    getCourses,
    getGrades,
    getAssignments,
    getCoursesUtil,
    getCoursesList,
};
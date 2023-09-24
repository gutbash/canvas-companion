const axios = require('axios');

const keyAPI = process.env.CANVAS_API_KEY;
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

        let response = await axios.get(`https://templeu.instructure.com/api/v1/courses?access_token=${keyAPI}`);
        let raw_data = response.data;

        let courses = raw_data.filter(d => d.enrollment_term_id === raw_data[0].enrollment_term_id)
            .map(d => ({ id: d.id, name: d.name }));

        let weightData = await Promise.all(courses.map(async course => {
            let response = await axios.get(`https://templeu.instructure.com/api/v1/courses/${course.id}/assignment_groups?access_token=${keyAPI}`);
            return response.data;
        }));
        weightData = weightData.flat();

        let courseData = await Promise.all(courses.map(async course => {
            let response = await axios.get(`https://templeu.instructure.com/api/v1/courses/${course.id}/assignments?access_token=${keyAPI}`);
            return response.data;
        }));
        courseData = courseData.flat();

        let assignments = courseData.map(assignment => {
            return {
                "name": assignment.name,
                "id": assignment.id,
                "due": assignment.due_at,
                "course_id": assignment.course_id,
                "weight": weightData.filter(d => d.id === assignment.assignment_group_id).map(d => d.group_weight)
            };
        });

        response = await axios.get(`https://templeu.instructure.com/api/v1/users/self/enrollments?access_token=${keyAPI}`);
        let gradeData = response.data;

        gradeData = gradeData.filter(course => courses.some(d => d.id === course.course_id))
            .map(course => {
                return {
                    'course_name': courses.find(d => d.id === course.course_id).name,
                    'course_id': course.course_id,
                    'score': course.grades.current_score,
                    'assignments': assignments.filter(d => d.course_id === course.course_id)
                };
            });

        let output = [];
        for (let i = 0; i < gradeData.length; i++) {
            output.push(`${gradeData[i]["course_name"]}: ${gradeData[i]["score"]}%`);
        }

        const gradesInfo = {
            "grades": output,
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
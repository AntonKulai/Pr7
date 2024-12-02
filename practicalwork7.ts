// Enums
enum StudentStatus {
    Active,
    Academic_Leave,
    Graduated,
    Expelled
}

enum CourseType {
    Mandatory,
    Optional,
    Special
}

enum Semester {
    First,
    Second
}

enum Grade {
    Excellent = 5,
    Good = 4,
    Satisfactory = 3,
    Unsatisfactory = 2
}

enum Faculty {
    Computer_Science,
    Economics,
    Law,
    Engineering
}

// Interfaces
interface Student {
    id: number;
    fullName: string;
    faculty: Faculty;
    year: number;
    status: StudentStatus;
    enrollmentDate: Date;
    groupNumber: string;
}

interface Course {
    id: number;
    name: string;
    type: CourseType;
    credits: number;
    semester: Semester;
    faculty: Faculty;
    maxStudents: number;
}

interface StudentGrade {
    studentId: number;
    courseId: number;
    grade: Grade;
    date: Date;
    semester: Semester;
}

// Клас управління університетом
class UniversityManagementSystem {
    private students: Student[] = [];
    private courses: Course[] = [];
    private grades: StudentGrade[] = [];
    private courseRegistrations: { studentId: number; courseId: number }[] = [];
    private nextStudentId: number = 1;
    private nextCourseId: number = 1;

    /**
     * Реєструє нового студента в системі.
     * @param student - Об'єкт студента без ID.
     * @returns Новий об'єкт студента з присвоєним ID.
     */
    enrollStudent(student: Omit<Student, "id">): Student {
        const newStudent: Student = { id: this.nextStudentId++, ...student };
        this.students.push(newStudent);
        return newStudent;
    }

    /**
     * Реєструє студента на курс.
     * @param studentId - ID студента.
     * @param courseId - ID курсу.
     */
    registerForCourse(studentId: number, courseId: number): void {
        const student = this.students.find(s => s.id === studentId);
        const course = this.courses.find(c => c.id === courseId);

        if (!student) {
            throw new Error("Студента не знайдено");
        }

        if (!course) {
            throw new Error("Курс не знайдено");
        }

        // Перевірка на максимальну кількість студентів
        const registrationsForCourse = this.courseRegistrations.filter(reg => reg.courseId === courseId);
        if (registrationsForCourse.length >= course.maxStudents) {
            throw new Error("Курс заповнений");
        }

        // Перевірка відповідності факультету
        if (student.faculty !== course.faculty) {
            throw new Error("Факультет студента не відповідає факультету курсу");
        }

        this.courseRegistrations.push({ studentId, courseId });
    }

    /**
     * Виставляє оцінку студенту за курс.
     * @param studentId - ID студента.
     * @param courseId - ID курсу.
     * @param grade - Оцінка.
     */
    setGrade(studentId: number, courseId: number, grade: Grade): void {
        const isRegistered = this.courseRegistrations.some(reg => reg.studentId === studentId && reg.courseId === courseId);

        if (!isRegistered) {
            throw new Error("Студент не зареєстрований на цей курс");
        }

        const course = this.courses.find(c => c.id === courseId);
        if (!course) {
            throw new Error("Курс не знайдено");
        }

        const newGrade: StudentGrade = {
            studentId,
            courseId,
            grade,
            date: new Date(),
            semester: course.semester
        };

        this.grades.push(newGrade);
    }

    /**
     * Оновлює статус студента.
     * @param studentId - ID студента.
     * @param newStatus - Новий статус.
     */
    updateStudentStatus(studentId: number, newStatus: StudentStatus): void {
        const student = this.students.find(s => s.id === studentId);

        if (!student) {
            throw new Error("Студента не знайдено");
        }

        // Валідація зміни статусу
        if (student.status === StudentStatus.Expelled && newStatus !== StudentStatus.Expelled) {
            throw new Error("Не можна змінити статус відрахованого студента");
        }

        student.status = newStatus;
    }

    /**
     * Повертає список студентів за факультетом.
     * @param faculty - Факультет.
     * @returns Масив студентів.
     */
    getStudentsByFaculty(faculty: Faculty): Student[] {
        return this.students.filter(s => s.faculty === faculty);
    }

    /**
     * Повертає всі оцінки студента.
     * @param studentId - ID студента.
     * @returns Масив оцінок.
     */
    getStudentGrades(studentId: number): StudentGrade[] {
        return this.grades.filter(g => g.studentId === studentId);
    }

    /**
     * Повертає доступні курси за факультетом та семестром.
     * @param faculty - Факультет.
     * @param semester - Семестр.
     * @returns Масив курсів.
     */
    getAvailableCourses(faculty: Faculty, semester: Semester): Course[] {
        return this.courses.filter(c => c.faculty === faculty && c.semester === semester);
    }

    /**
     * Обчислює середню оцінку студента.
     * @param studentId - ID студента.
     * @returns Середня оцінка.
     */
    calculateAverageGrade(studentId: number): number {
        const studentGrades = this.getStudentGrades(studentId);

        if (studentGrades.length === 0) {
            return 0;
        }

        const total = studentGrades.reduce((sum, g) => sum + g.grade, 0);
        return total / studentGrades.length;
    }

    /**
     * Повертає список відмінників по факультету.
     * @param faculty - Факультет.
     * @returns Масив студентів-відмінників.
     */
    getTopStudents(faculty: Faculty): Student[] {
        const studentsInFaculty = this.getStudentsByFaculty(faculty);
        const studentAverages = studentsInFaculty.map(student => ({
            student,
            averageGrade: this.calculateAverageGrade(student.id)
        }));

        const topAverage = Math.max(...studentAverages.map(sa => sa.averageGrade));

        return studentAverages
            .filter(sa => sa.averageGrade === topAverage && sa.averageGrade > 0)
            .map(sa => sa.student);
    }

    /**
     * Додає новий курс в систему.
     * @param course - Об'єкт курсу без ID.
     * @returns Новий об'єкт курсу з присвоєним ID.
     */
    addCourse(course: Omit<Course, "id">): Course {
        const newCourse: Course = { id: this.nextCourseId++, ...course };
        this.courses.push(newCourse);
        return newCourse;
    }
}

// Приклад використання системи
const ums = new UniversityManagementSystem();

// Додавання курсів
const course1 = ums.addCourse({
    name: "Програмування",
    type: CourseType.Mandatory,
    credits: 5,
    semester: Semester.First,
    faculty: Faculty.Computer_Science,
    maxStudents: 30
});

// Додавання студентів
const student1 = ums.enrollStudent({
    fullName: "Іван Іванов",
    faculty: Faculty.Computer_Science,
    year: 1,
    status: StudentStatus.Active,
    enrollmentDate: new Date(),
    groupNumber: "CS-101"
});

// Реєстрація студента на курс
ums.registerForCourse(student1.id, course1.id);

// Виставлення оцінки
ums.setGrade(student1.id, course1.id, Grade.Excellent);

// Отримання середньої оцінки
const average = ums.calculateAverageGrade(student1.id);
console.log(`Середня оцінка студента ${student1.fullName}: ${average}`);

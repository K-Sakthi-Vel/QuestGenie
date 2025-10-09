import React, { useEffect, useState } from 'react';
import { useQuiz } from '../contexts/QuizContext';
import { useProgress } from '../contexts/ProgressContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard() {
    const { answers } = useQuiz();
    const { stats } = useProgress();
    const [dashboardStats, setDashboardStats] = useState({
        quizzesTaken: 0,
        accuracy: 0,
        studyTime: '0h 0m',
        totalQuestions: 0,
    });
    const [weakTopics, setWeakTopics] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [pieChartData, setPieChartData] = useState([]);
    const [recentQuizzes, setRecentQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const allQuizzes = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('quiz_')) {
                try {
                    allQuizzes.push(JSON.parse(localStorage.getItem(key)));
                } catch (error) {
                    console.error(`Failed to parse quiz from localStorage with key: ${key}`, error);
                }
            }
        }

        if (allQuizzes.length > 0) {
            let totalQuestions = 0;
            let correctAnswers = 0;
            const incorrect = [];
            const performanceData = [];
            const recentQuizzesData = [];

            allQuizzes.forEach(quiz => {
                if (quiz && quiz.questions) {
                    let quizCorrect = 0;
                    const userAnswers = answers[quiz.sourceId] || {};
                    quiz.questions.forEach(q => {
                        totalQuestions++;
                        if (userAnswers[q.id] === q.answer) {
                            correctAnswers++;
                            quizCorrect++;
                        } else {
                            incorrect.push(q.question);
                        }
                    });
                    const accuracy = (quizCorrect / quiz.questions.length) * 100;
                    performanceData.push({
                        name: quiz.title || quiz.sourceId.substring(0, 15), // Use title, fallback to shortened sourceId
                        accuracy: accuracy,
                    });
                    recentQuizzesData.push({
                        title: quiz.title || quiz.sourceId.substring(0, 25),
                        score: `${quizCorrect}/${quiz.questions.length}`,
                        accuracy: `${Math.round(accuracy)}%`,
                    });
                }
            });

            const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
            const studyTimeInSeconds = stats.studyTime || 0;
            const hours = Math.floor(studyTimeInSeconds / 3600);
            const minutes = Math.floor((studyTimeInSeconds % 3600) / 60);
            const formattedStudyTime = `${hours}h ${minutes}m`;

            setDashboardStats({
                quizzesTaken: allQuizzes.length,
                accuracy: accuracy,
                studyTime: formattedStudyTime,
                totalQuestions: totalQuestions,
            });
            setWeakTopics(incorrect);
            setChartData(performanceData);
            setRecentQuizzes(recentQuizzesData);
            setPieChartData([
                { name: 'Correct', value: correctAnswers },
                { name: 'Incorrect', value: totalQuestions - correctAnswers },
            ]);
        } else {
            setDashboardStats({
                quizzesTaken: 0,
                accuracy: 0,
                studyTime: '0h 0m',
            });
            setWeakTopics([]);
            setChartData([]);
            setPieChartData([]);
            setRecentQuizzes([]);
        }
        setLoading(false);
    }, [answers, stats]);

    if (loading) {
        return <div className="text-center p-10">Loading dashboard...</div>;
    }

    return (
        <div className="p-4 bg-gray-50 h-[calc(100vh-60px)] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                <div className="p-6 bg-white rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold text-gray-600">Quizzes Taken</h2>
                    <p className="text-3xl sm:text-4xl font-bold text-indigo-600">{dashboardStats.quizzesTaken}</p>
                </div>
                <div className="p-6 bg-white rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold text-gray-600">Overall Accuracy</h2>
                    <p className="text-3xl sm:text-4xl font-bold text-green-600">{dashboardStats.accuracy}%</p>
                </div>
                <div className="p-6 bg-white rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold text-gray-600">Total Study Time</h2>
                    <p className="text-3xl sm:text-4xl font-bold text-blue-600">{dashboardStats.studyTime}</p>
                </div>
                <div className="p-6 bg-white rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold text-gray-600">Total Questions</h2>
                    <p className="text-3xl sm:text-4xl font-bold text-purple-600">{dashboardStats.totalQuestions}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="md:col-span-2 p-6 bg-white rounded-lg shadow-md">
                    <h3 className="font-semibold text-xl mb-4 text-gray-700">Quiz Performance</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-2 text-center">Accuracy per Quiz</h4>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="accuracy" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg mb-2 text-center">Overall Performance</h4>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                                        <Cell key="cell-0" fill="#82ca9d" />
                                        <Cell key="cell-1" fill="#ff6b6b" />
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
                <div className="p-6 bg-white rounded-lg shadow-md">
                    <h3 className="font-semibold text-xl mb-4 text-gray-700">Areas for Improvement</h3>
                    {weakTopics.length > 0 ? (
                        <ul className="space-y-2">
                            {weakTopics.slice(0, 5).map((topic, index) => ( // Show top 5
                                <li key={index} className="text-sm p-2 bg-red-50 rounded-md">{topic}</li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-500">No weak topics identified yet. Great job!</p>
                    )}
                </div>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md">
                <h3 className="font-semibold text-xl mb-4 text-gray-700">Recent Quizzes</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Quiz Title</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Score</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Accuracy</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentQuizzes.slice(0, 5).map((quiz, index) => (
                                <tr key={index} className="border-b">
                                    <td className="py-3 px-4">{quiz.title}</td>
                                    <td className="py-3 px-4">{quiz.score}</td>
                                    <td className="py-3 px-4">{quiz.accuracy}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

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
    });
    const [weakTopics, setWeakTopics] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [pieChartData, setPieChartData] = useState([]);
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
                    performanceData.push({
                        name: quiz.sourceId.substring(0, 15), // Shorten name for chart
                        accuracy: (quizCorrect / quiz.questions.length) * 100,
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
            });
            setWeakTopics(incorrect);
            setChartData(performanceData);
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
        }
        setLoading(false);
    }, [answers, stats]);

    if (loading) {
        return <div className="text-center p-10">Loading dashboard...</div>;
    }

    return (
        <div className="p-4 bg-gray-50 min-h-screen">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="p-6 bg-white rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold text-gray-600">Quizzes Taken</h2>
                    <p className="text-4xl font-bold text-indigo-600">{dashboardStats.quizzesTaken}</p>
                </div>
                <div className="p-6 bg-white rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold text-gray-600">Overall Accuracy</h2>
                    <p className="text-4xl font-bold text-green-600">{dashboardStats.accuracy}%</p>
                </div>
                <div className="p-6 bg-white rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold text-gray-600">Total Study Time</h2>
                    <p className="text-4xl font-bold text-blue-600">{dashboardStats.studyTime}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 p-6 bg-white rounded-lg shadow-md">
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
        </div>
    );
}

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar, UserMenu } from '@/components/layout';
import { ProtectedRoute } from './ProtectedRoute';
import {
    SignInPage,
    ExportReportPage,
    ReportTaskConfigPage,
    TaskEditorPage,
    AddImagePage,
    RobotImageConfigPage,
} from '@/pages';

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <Navbar />
                <UserMenu />
            </div>
            {children}
        </div>
    );
};

export const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/signin" element={<SignInPage />} />

                <Route
                    path="/export-report"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <ExportReportPage />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/report-task-config"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <ReportTaskConfigPage />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/task-editor"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <TaskEditorPage />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/add-image"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <AddImagePage />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/report-image-config"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <RobotImageConfigPage />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route path="/" element={<Navigate to="/export-report" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

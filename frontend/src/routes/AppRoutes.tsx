import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar, UserMenu, Sidebar } from '@/components/layout';
import { ProtectedRoute } from './ProtectedRoute';
import {
    SignInPage,
    ExportReportPage,
    ReportTaskConfigPage,
    TaskEditorPage,
    AddImagePage,
    RobotImageConfigPage,
    ManageRolesPage,
    DownloadReportPage,
} from '@/pages';
import { RobotListPage } from '@/pages/RobotListPage';
import { WorkforcePage } from '@/pages/WorkforcePage';
import { RobotReportPage } from '@/pages/RobotReportPage';

// นำเข้าหน้า MIOC ที่เพิ่งสร้าง (ถ้า Path ไม่ตรง ให้แก้ให้ตรงกับที่คุณสร้างไฟล์)
import MiocDashboardPage from '../pages/MiocDashboardPage';

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', background: '#0F0F1D' }}>
                <Navbar />
                <UserMenu />
            </div>
            <div style={{ display: 'flex', flex: 1 }}>
                <Sidebar />
                <div style={{ flex: 1, overflow: 'auto' }}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/signin" element={<SignInPage />} />

                <Route
                    path="/download-report"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <DownloadReportPage />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

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

                {/* --- ส่วนที่เพิ่มใหม่สำหรับ MIOC --- */}
                <Route
                    path="/mioc-dashboard"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <MiocDashboardPage />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/manage-roles"
                    element={
                        <ProtectedRoute requiredRoles={['admin']}>
                            <Layout>
                                <ManageRolesPage />
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                
                <Route
                    path="/robots"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <RobotListPage />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/workforce"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <WorkforcePage />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/robot-cleaning-report"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <RobotReportPage />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                                <Route path="/" element={<Navigate to="/export-report" replace />} />
                            </Routes>
                        </BrowserRouter>
                    );
                };
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

// นำเข้าหน้า MIOC
import MiocDashboardPage from '../pages/MiocDashboardPage';

// นำเข้าหน้า MROI
import { MroiDashboard, DevicesPage } from '../pages/mroi';

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

                {/* --- ส่วนที่เพิ่มใหม่สำหรับ MROI --- */}
                <Route
                    path="/mroi"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <MroiDashboard />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/mroi/devices"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <DevicesPage />
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

                <Route path="/" element={<Navigate to="/export-report" replace />} />
            </Routes>
        </BrowserRouter>
    );
};
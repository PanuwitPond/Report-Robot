import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar, UserMenu, Sidebar } from '@/components/layout';
import { ProtectedRoute } from './ProtectedRoute';
import { getDefaultRouteByRole } from '@/utils/roleBasedRedirect';
import { SignInPage } from '@/pages/auth';
import { ReportTaskConfigPage, DownloadReportPage } from '@/pages/reports';
import { TaskEditorPage } from '@/pages/tasks';
import { AddImagePage } from '@/pages/images';
import { RobotImageConfigPage, RobotListPage, RobotReportPage } from '@/pages/robots';
import { ManageRolesPage } from '@/pages/admin';
import { WorkforcePage } from '@/pages/workforce';
import { PageReport as MiocDashboardPage } from '@/pages/mioc';
import { MroiDashboard, DevicesPage, RoisPage, SchedulesPage, RoiEditor } from '@/pages/mroi';

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

// Helper component to get default route based on user roles
const DefaultRoute = () => {
    const { user } = useAuth();
    const defaultPath = getDefaultRouteByRole(user?.roles);
    return <Navigate to={defaultPath} replace />;
};

import { useAuth } from '@/contexts';

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
                    path="/mroi/rois"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <RoisPage />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/mroi/schedules"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <SchedulesPage />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/mroi/editor"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <RoiEditor />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/mroi/editor/:deviceId"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <RoiEditor />
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

                <Route path="/" element={<DefaultRoute />} />
                            </Routes>
                        </BrowserRouter>
                    );
                };
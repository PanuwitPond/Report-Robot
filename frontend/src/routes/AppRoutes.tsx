import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar, UserMenu, Sidebar } from '@/components/layout';
import { ProtectedRoute } from './ProtectedRoute';
import { getDefaultRouteByRole } from '@/utils/roleBasedRedirect';
import { SignInPage, UnauthorizedPage } from '@/pages/auth';
import { ReportTaskConfigPage, DownloadReportPage } from '@/pages/reports';
import { TaskEditorPage } from '@/pages/tasks';
import { AddImagePage } from '@/pages/images';
import { RobotImageConfigPage, RobotListPage, RobotReportPage } from '@/pages/robots';
import { ManageRolesPage } from '@/pages/admin';
import { WorkforcePage } from '@/pages/workforce';
import { PageReport as MiocDashboardPage } from '@/pages/mioc';
import { useAuth } from '@/contexts';

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

export const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/signin" element={<SignInPage />} />
                <Route path="/unauthorized" element={<UnauthorizedPage />} />

                {/* --- METTPOLE Routes (admin, service) --- */}
                <Route
                    path="/download-report"
                    element={
                        <ProtectedRoute requiredRoles={['admin', 'service']}>
                            <Layout>
                                <DownloadReportPage />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/report-task-config"
                    element={
                        <ProtectedRoute requiredRoles={['admin', 'service']}>
                            <Layout>
                                <ReportTaskConfigPage />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/task-editor"
                    element={
                        <ProtectedRoute requiredRoles={['admin', 'service']}>
                            <Layout>
                                <TaskEditorPage />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/add-image"
                    element={
                        <ProtectedRoute requiredRoles={['admin', 'service']}>
                            <Layout>
                                <AddImagePage />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/report-image-config"
                    element={
                        <ProtectedRoute requiredRoles={['admin', 'service']}>
                            <Layout>
                                <RobotImageConfigPage />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                {/* --- METTBOT Routes (admin, service) --- */}
                <Route
                    path="/robots"
                    element={
                        <ProtectedRoute requiredRoles={['admin', 'service']}>
                            <Layout>
                                <RobotListPage />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/workforce"
                    element={
                        <ProtectedRoute requiredRoles={['admin', 'service']}>
                            <Layout>
                                <WorkforcePage />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/robot-cleaning-report"
                    element={
                        <ProtectedRoute requiredRoles={['admin', 'service']}>
                            <Layout>
                                <RobotReportPage />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                {/* --- MIOC Routes (admin, mioc) --- */}
                <Route
                    path="/mioc-dashboard"
                    element={
                        <ProtectedRoute requiredRoles={['admin', 'mioc']}>
                            <Layout>
                                <MiocDashboardPage />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                {/* --- Admin Routes (admin only) --- */}
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

                {/* --- Default Route --- */}
                <Route path="/" element={<DefaultRoute />} />

                {/* --- Catch-all for undefined routes --- */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
};
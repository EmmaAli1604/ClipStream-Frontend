// EditarPerfil.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./EditarPerfil.css";

interface UserProfile {
  usuarioId: number;
  nombre: string;
  apellido: string;
  username: string;
  correo: string;
}

interface UpdateProfileData {
  nombre: string;
  apellido: string;
  username: string;
  correo: string;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface DeleteAccountData {
  password: string;
}

type Message = { type: "success" | "error" | "" ; text: string };

export default function EditarPerfil() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("profile");
  const navigate = useNavigate();

  // Estados para cada sección
  const [profileData, setProfileData] = useState<UpdateProfileData>({
    nombre: "",
    apellido: "",
    username: "",
    correo: ""
  });

  const [passwordData, setPasswordData] = useState<ChangePasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [deleteData, setDeleteData] = useState<DeleteAccountData>({
    password: ""
  });

  // Mensajes y cargando
  const [profileMessage, setProfileMessage] = useState<Message>({ type: '', text: '' });
  const [passwordMessage, setPasswordMessage] = useState<Message>({ type: '', text: '' });
  const [deleteMessage, setDeleteMessage] = useState<Message>({ type: '', text: '' });

  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Auto-cerrar mensajes después de X ms
  useEffect(() => {
    const timers: number[] = [];
    [profileMessage, passwordMessage, deleteMessage].forEach((m) => {
      if (m.text) {
        const t = window.setTimeout(() => {
          if (m === profileMessage) setProfileMessage({ type: '', text: '' });
          if (m === passwordMessage) setPasswordMessage({ type: '', text: '' });
          if (m === deleteMessage) setDeleteMessage({ type: '', text: '' });
        }, 5000);
        timers.push(t);
      }
    });
    return () => timers.forEach((t) => clearTimeout(t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileMessage.text, passwordMessage.text, deleteMessage.text]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
          navigate("/login");
          return;
        }

        const userData = JSON.parse(storedUser);
        const userId = userData.usuarioId;

        if (!userId) {
          navigate("/login");
          return;
        }

        const response = await fetch(`http://localhost:8080/api/users/${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error("Error al cargar el perfil");
        }

        const profileData: UserProfile = await response.json();
        setUserProfile(profileData);
        setProfileData({
          nombre: profileData.nombre,
          apellido: profileData.apellido,
          username: profileData.username,
          correo: profileData.correo
        });
        
      } catch (err) {
        console.error("Error al cargar el perfil:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  // Manejar cambios en los formularios
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validación en vivo: si cambia confirmación o nueva contraseña, establecer mensaje de error inmediato
    if ((name === 'newPassword' || name === 'confirmPassword') && passwordMessage.type === 'error') {
      // si había mensaje de error previo sobre mismatch lo limpiamos para no confundir
      setPasswordMessage({ type: '', text: '' });
    }
  };

  const handleDeleteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDeleteData(prev => ({
      ...prev,
      [name]: value
    }));
    if (deleteMessage.type === 'error') {
      setDeleteMessage({ type: '', text: '' });
    }
  };

  // Helper para mostrar mensajes (centrado)
  const showProfileMessage = (type: Message['type'], text: string) => setProfileMessage({ type, text });
  const showPasswordMessage = (type: Message['type'], text: string) => setPasswordMessage({ type, text });
  const showDeleteMessage = (type: Message['type'], text: string) => setDeleteMessage({ type, text });

  // --- Actualizar perfil ---
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);
    setProfileMessage({ type: '', text: '' });

    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) throw new Error("Usuario no autenticado");

      const userData = JSON.parse(storedUser);
      const userId = userData.usuarioId;

      const response = await fetch(`http://localhost:8080/api/users/${userId}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData)
      });

      const result = await response.json();

      if (result.success) {
        showProfileMessage('success', result.message || 'Tus datos han sido actualizados.');
        // Actualizar localStorage y estado
        const updatedUser = {
          ...userData,
          nombre: profileData.nombre,
          apellido: profileData.apellido,
          username: profileData.username,
          correo: profileData.correo
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUserProfile(prev => prev ? { ...prev, ...profileData } : null);
      } else {
        // Mensajes más amigables para duplicados
        const msg = (result.message || '').toLowerCase();
        if (msg.includes('username') || msg.includes('nombre de usuario') || msg.includes('usuario ya existe') || msg.includes('ya existe')) {
          showProfileMessage('error', 'El nombre de usuario ya existe. Elige otro.');
        } else if (msg.includes('correo') || msg.includes('email')) {
          showProfileMessage('error', 'El correo ya está en uso. Usa otro correo.');
        } else {
          showProfileMessage('error', result.message || 'No fue posible actualizar tus datos.');
        }
      }
    } catch (error: any) {
      console.error(error);
      showProfileMessage('error', "Error al actualizar el perfil");
    } finally {
      setUpdatingProfile(false);
    }
  };

  // --- Cambiar contraseña ---
  // Validaciones reactivas
  const isPasswordMismatch = passwordData.newPassword !== passwordData.confirmPassword;
  const isNewPasswordTooShort = passwordData.newPassword.length > 0 && passwordData.newPassword.length < 6;
  const canChangePassword = !changingPassword && !isPasswordMismatch && !isNewPasswordTooShort && passwordData.currentPassword.length > 0;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangingPassword(true);
    setPasswordMessage({ type: '', text: '' });

    // Validaciones cliente (doble comprobación)
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showPasswordMessage('error', 'Las contraseñas no coinciden.');
      setChangingPassword(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showPasswordMessage('error', 'La contraseña debe tener al menos 6 caracteres.');
      setChangingPassword(false);
      return;
    }

    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) throw new Error("Usuario no autenticado");

      const userData = JSON.parse(storedUser);
      const userId = userData.usuarioId;

      const response = await fetch(`http://localhost:8080/api/users/${userId}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const result = await response.json();

      if (result.success) {
        showPasswordMessage('success', result.message || 'Contraseña actualizada correctamente.');
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
      } else {
        // Traducción amigable de errores comunes
        const msg = (result.message || '').toLowerCase();
        if (msg.includes('no coincide') || msg.includes('incorrecta') || msg.includes('contraseña actual')) {
          showPasswordMessage('error', 'Tu contraseña no coincide con la actual.');
        } else {
          showPasswordMessage('error', result.message || 'No fue posible cambiar la contraseña.');
        }
      }
    } catch (error: any) {
      console.error(error);
      showPasswordMessage('error', "Error al cambiar la contraseña.");
    } finally {
      setChangingPassword(false);
    }
  };

  // --- Eliminar cuenta ---
  const canDelete = !deletingAccount && deleteData.password.length > 0;

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeletingAccount(true);
    setDeleteMessage({ type: '', text: '' });

    if (!window.confirm("¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.")) {
      setDeletingAccount(false);
      return;
    }

    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) throw new Error("Usuario no autenticado");

      const userData = JSON.parse(storedUser);
      const userId = userData.usuarioId;

      const response = await fetch(`http://localhost:8080/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: deleteData.password
        })
      });

      const result = await response.json();

      if (result.success) {
        // Limpiar localStorage y redirigir
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new CustomEvent('authChange', { detail: { isLoggedIn: false } }));
        navigate("/");
      } else {
        const msg = (result.message || '').toLowerCase();
        if (msg.includes('no coincide') || msg.includes('incorrecta') || msg.includes('contraseña')) {
          showDeleteMessage('error', 'Tu contraseña no coincide con la actual.');
        } else {
          showDeleteMessage('error', result.message || 'No fue posible eliminar la cuenta.');
        }
      }
    } catch (error: any) {
      console.error(error);
      showDeleteMessage('error', "Error al eliminar la cuenta.");
    } finally {
      setDeletingAccount(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-profile-container">
        <div className="loading">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="edit-profile-container">
      <div className="edit-profile-header">
        <button onClick={() => navigate("/profile")} className="back-button">
          ← Volver al Perfil
        </button>
        <h1>Editar Perfil</h1>
      </div>

      <div className="edit-profile-content">
        {/* Navegación lateral */}
        <div className="profile-sidebar">
          <button
            className={`sidebar-item ${activeSection === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveSection('profile')}
          >
            📝 Información Personal
          </button>
          <button
            className={`sidebar-item ${activeSection === 'password' ? 'active' : ''}`}
            onClick={() => setActiveSection('password')}
          >
            🔒 Cambiar Contraseña
          </button>
          <button
            className={`sidebar-item ${activeSection === 'delete' ? 'active' : ''}`}
            onClick={() => setActiveSection('delete')}
          >
            🗑️ Eliminar Cuenta
          </button>
        </div>

        {/* Contenido principal */}
        <div className="profile-main-content">
          {/* Sección de Información Personal */}
          {activeSection === 'profile' && (
            <div className="profile-section">
              <h2>Información Personal</h2>
              <form onSubmit={handleUpdateProfile} className="profile-form" noValidate>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="nombre">Nombre</label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={profileData.nombre}
                      onChange={handleProfileChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="apellido">Apellido</label>
                    <input
                      type="text"
                      id="apellido"
                      name="apellido"
                      value={profileData.apellido}
                      onChange={handleProfileChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="username">Nombre de Usuario</label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={profileData.username}
                      onChange={handleProfileChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="correo">Correo Electrónico</label>
                    <input
                      type="email"
                      id="correo"
                      name="correo"
                      value={profileData.correo}
                      onChange={handleProfileChange}
                      required
                    />
                  </div>
                </div>

                {profileMessage.text && (
                  <div className={`message ${profileMessage.type}`} role="status" aria-live="polite">
                    {profileMessage.type === 'success' ? '✓ ' : '✕ '}
                    {profileMessage.text}
                  </div>
                )}

                <button
                  type="submit"
                  className="save-button"
                  disabled={updatingProfile}
                >
                  {updatingProfile ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </form>
            </div>
          )}

          {/* Sección de Cambiar Contraseña */}
          {activeSection === 'password' && (
            <div className="profile-section">
              <h2>Cambiar Contraseña</h2>
              <form onSubmit={handleChangePassword} className="profile-form" noValidate>
                <div className="form-group">
                  <label htmlFor="currentPassword">Contraseña Actual</label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword">Nueva Contraseña</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength={6}
                  />
                  <small>Mínimo 6 caracteres</small>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirmar Nueva Contraseña</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>

                {/* Mensajes de validación en vivo */}
                {isPasswordMismatch && (
                  <div className="message error" role="alert">✕ Las contraseñas no coinciden.</div>
                )}
                {isNewPasswordTooShort && (
                  <div className="message error" role="alert">✕ La contraseña debe tener al menos 6 caracteres.</div>
                )}

                {passwordMessage.text && (
                  <div className={`message ${passwordMessage.type}`} role="status" aria-live="polite">
                    {passwordMessage.type === 'success' ? '✓ ' : '✕ '}
                    {passwordMessage.text}
                  </div>
                )}

                <button
                  type="submit"
                  className="save-button"
                  disabled={!canChangePassword}
                  title={!canChangePassword ? 'Completa correctamente los campos para habilitar' : 'Cambiar contraseña'}
                >
                  {changingPassword ? 'Cambiando...' : 'Cambiar Contraseña'}
                </button>
              </form>
            </div>
          )}

          {/* Sección de Eliminar Cuenta */}
          {activeSection === 'delete' && (
            <div className="profile-section danger-section">
              <h2>Eliminar Cuenta</h2>
              <div className="warning-message">
                <h3>⚠️ Advertencia</h3>
                <p>Esta acción no se puede deshacer. Se eliminarán todos tus datos, cortometrajes y información asociada a tu cuenta.</p>
              </div>

              <form onSubmit={handleDeleteAccount} className="profile-form" noValidate>
                <div className="form-group">
                  <label htmlFor="deletePassword">Confirma tu contraseña para eliminar la cuenta</label>
                  <input
                    type="password"
                    id="deletePassword"
                    name="password"
                    value={deleteData.password}
                    onChange={handleDeleteChange}
                    required
                  />
                </div>

                {deleteMessage.text && (
                  <div className={`message ${deleteMessage.type}`} role="status" aria-live="polite">
                    {deleteMessage.type === 'success' ? '✓ ' : '✕ '}
                    {deleteMessage.text}
                  </div>
                )}

                <button
                  type="submit"
                  className="delete-button"
                  disabled={!canDelete}
                  title={!canDelete ? 'Ingresa tu contraseña para habilitar' : 'Eliminar cuenta permanentemente'}
                >
                  {deletingAccount ? 'Eliminando...' : 'Eliminar Cuenta Permanentemente'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

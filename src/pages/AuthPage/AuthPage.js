import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase';  // Importa las configuraciones de Firebase
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth';  // Funciones de autenticación de Firebase
import { setDoc, doc } from 'firebase/firestore';  // Funciones de Firestore
import { useNavigate } from 'react-router-dom';  // Redirección con React Router
import Message from './Message';  // Componente para mostrar mensajes de error o éxito
import './AuthPage.css';  // Estilos del componente

const AuthForm = () => {
  // Estado para manejar los datos del formulario, el estado de inicio de sesión y mensajes de error o éxito
  const [formData, setFormData] = useState({
    email: '',  // Correo electrónico
    password: '',  // Contraseña
    confirmPassword: '',  // Confirmación de contraseña
    username: '',  // Nombre de usuario
    profile: 'Operador'  // Perfil por defecto (Operador)
  });
  const [isLogin, setIsLogin] = useState(true);  // Determina si el formulario es de login o registro
  const [message, setMessage] = useState('');  // Mensaje de error o éxito
  const [messageType, setMessageType] = useState('');  // Tipo de mensaje (error o éxito)
  const [showPassword, setShowPassword] = useState(false);  // Controla la visibilidad de la contraseña
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);  // Controla la visibilidad de la confirmación de contraseña
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);  // Estado para detectar si la tecla Caps Lock está activada
  const navigate = useNavigate();  // Hook de React Router para redirigir

  // Efecto para verificar si hay un usuario autenticado, redirigiendo al dashboard si es así
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate('/dashboard');  // Redirige al dashboard si el usuario está autenticado
      }
    });
    return () => unsubscribe();  // Limpia el efecto cuando el componente se desmonta
  }, [navigate]);

  // Maneja el cambio de valores en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Detecta cuando la tecla Caps Lock está activada
  const handleKeyPress = (e) => {
    setIsCapsLockOn(e.getModifierState('CapsLock'));
  };

  // Maneja el envío del formulario para login o registro
  const handleSubmit = async (e) => {
    e.preventDefault();  // Prevenir el comportamiento por defecto del formulario
    const { email, password, confirmPassword, username, profile } = formData;
    
    // Validar formato del correo electrónico
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setMessage('Por favor ingresa un correo electrónico válido');
      setMessageType('error');
      return;
    }
    
    // Validar que las contraseñas coincidan en el registro
    if (!isLogin && password !== confirmPassword) {
      setMessage('Las contraseñas no coinciden');
      setMessageType('error');
      return;
    }
    
    try {
      await setPersistence(auth, browserLocalPersistence);  // Configura la persistencia en el navegador
      if (isLogin) {
        // Si es login, se utiliza signInWithEmailAndPassword
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Si es registro, se crea un nuevo usuario
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        // Se guarda el nuevo usuario en Firestore
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          username,
          profile
        });
      }
      setMessage(isLogin ? 'Inicio de sesión exitoso' : 'Registro exitoso');
      setMessageType('success');
      navigate('/dashboard');  // Redirige al dashboard después de iniciar sesión o registrarse
    } catch (error) {
      // Manejo de errores según el código del error
      let errorMessage = '';
      switch (error.code) {
        case 'auth/wrong-password':
          errorMessage = 'La contraseña es incorrecta.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No se encontró un usuario con ese correo.';
          break;
        case 'auth/email-already-in-use':
          errorMessage = 'El correo electrónico ya está registrado.';
          break;
        default:
          errorMessage = 'Ocurrió un error, verifica correo o contraseña.';
      }
      setMessage(errorMessage);  // Muestra el mensaje de error
      setMessageType('error');
    }
  };

  // Toggle para mostrar/ocultar la contraseña
  const toggleShowPassword = () => setShowPassword((prev) => !prev);
  // Toggle para mostrar/ocultar la confirmación de la contraseña
  const toggleShowConfirmPassword = () => setShowConfirmPassword((prev) => !prev);
  // Cambia entre el formulario de inicio de sesión y el de registro
  const toggleForm = () => setIsLogin((prev) => !prev);

  return (
    <div className="auth-page-unique">
      <div className="container-unique">
        {message && <Message message={message} type={messageType} />}  {/* Muestra el mensaje si existe */}
        <p className="title-unique">{isLogin ? 'Inicia Sesión para acceder' : 'Regístrate para usar la plataforma'}</p>
        <form onSubmit={handleSubmit}>
          {/* Formulario de correo */}
          <div className="form-control-unique">
            <input
              type="email"
              name="email"
              placeholder="Correo Electrónico"
              className="no-border-unique"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          {/* Formulario de contraseña */}
          <div className="form-control-unique">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Contraseña"
              className="no-border-unique"
              value={formData.password}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
            />
            {isCapsLockOn && <span style={{ color: 'red' }}>Mayúsculas activadas</span>}
            <button type="button" onClick={toggleShowPassword} className="toggle-password-unique">
              {showPassword ? '👁️' : '🙈'}
            </button>
          </div>
          {/* Si es registro, muestra los campos de confirmación de contraseña, nombre de usuario y perfil */}
          {!isLogin && (
            <>
              <div className="form-control-unique">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Confirma Contraseña"
                  className="no-border-unique"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                />
                {isCapsLockOn && <span style={{ color: 'red' }}>Mayúsculas activadas</span>}
                <button type="button" onClick={toggleShowConfirmPassword} className="toggle-password-unique">
                  {showConfirmPassword ? '👁️' : '🙈'}
                </button>
              </div>
              <div className="form-control-unique">
                <input
                  type="text"
                  name="username"
                  placeholder="Nombre Usuario"
                  className="no-border-unique"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
              <div className="form-control-unique">
                <select
                  name="profile"
                  className="no-border-unique"
                  value={formData.profile}
                  onChange={handleChange}
                >
                  <option value="Operador">Operador</option>
                  <option value="Líder de Equipo">Líder de Equipo</option>
                </select>
              </div>
            </>
          )}
          <button className="submit-unique" type="submit">{isLogin ? 'Inicia Sesión' : 'Regístrate'}</button>
        </form>
        {/* Si es login, muestra el enlace para recuperar la contraseña */}
        {isLogin && (
          <button onClick={() => console.log("Función para resetear contraseña")} className="forgot-password-unique">
            ¿Olvidaste tu contraseña?
          </button>
        )}
        {/* Enlace para cambiar entre el formulario de login y el de registro */}
        <p>{isLogin ? '¿No estás registrado?' : '¿Ya estás registrado?'}</p>
        <button onClick={toggleForm} className="side-button-unique">
          {isLogin ? 'Regístrate' : 'Inicia sesión'}
        </button>
      </div>
    </div>
  );
};

export default AuthForm;

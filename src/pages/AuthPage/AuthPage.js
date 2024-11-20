import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import Message from './Message';
import './AuthPage.css';

const AuthForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    profile: 'Operador'
  });
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate('/dashboard');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleKeyPress = (e) => {
    setIsCapsLockOn(e.getModifierState('CapsLock'));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password, confirmPassword, username, profile } = formData;
    
    // Validar formato del correo electrónico
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setMessage('Por favor ingresa un correo electrónico válido');
      setMessageType('error');
      return;
    }
    
    if (!isLogin && password !== confirmPassword) {
      setMessage('Las contraseñas no coinciden');
      setMessageType('error');
      return;
    }
    try {
      await setPersistence(auth, browserLocalPersistence);
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          username,
          profile
        });
      }
      setMessage(isLogin ? 'Inicio de sesión exitoso' : 'Registro exitoso');
      setMessageType('success');
      navigate('/dashboard');
    } catch (error) {
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
      setMessage(errorMessage);
      setMessageType('error');
    }
  };

  const toggleShowPassword = () => setShowPassword((prev) => !prev);
  const toggleShowConfirmPassword = () => setShowConfirmPassword((prev) => !prev);
  const toggleForm = () => setIsLogin((prev) => !prev);

  return (
    <div className="auth-page-unique">
      <div className="container-unique">
        {message && <Message message={message} type={messageType} />}
        <p className="title-unique">{isLogin ? 'Inicia Sesión para acceder' : 'Regístrate para usar la plataforma'}</p>
        <form onSubmit={handleSubmit}>
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
        {isLogin && (
          <button onClick={() => console.log("Función para resetear contraseña")} className="forgot-password-unique">
            ¿Olvidaste tu contraseña?
          </button>
        )}
        <p>{isLogin ? '¿No estás registrado?' : '¿Ya estás registrado?'}</p>
        <button onClick={toggleForm} className="side-button-unique">
          {isLogin ? 'Registro' : 'Login'}
        </button>
      </div>
    </div>
  );
};

export default AuthForm;

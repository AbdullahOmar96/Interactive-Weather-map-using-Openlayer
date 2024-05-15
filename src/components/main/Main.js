// import bootstrap from 'bootstrap';
import Alert from 'react-bootstrap/Alert';
import React from 'react';
import './Main.css';

function Main() {
    return (
        <>
        {[
          'primary',
          'secondary',
          'success',
          'danger',
          'warning',
          'info',
          'light',
          'dark',
        ].map((variant) => (
          <Alert key={variant} variant={variant}>
            This is a {variant} alert—check it out!
          </Alert>
        ))}
      </>
    );
  }
  
  export default Main;
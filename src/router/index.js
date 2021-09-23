import React from 'react';
import WebSSh from '../pages/ssh';
import {BrowserRouter,Route } from 'react-router-dom';

class Routes extends React.Component{
    render(){
        return(
            <BrowserRouter>
                <Route path="/" component={WebSSh} /> 
            </BrowserRouter>
        )
    }
}

export default Routes;
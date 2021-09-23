
import React from 'react';
import { Form, Input, Button, Modal, message } from 'antd';
import './css/login.css';
import { get, post } from '../../api/request';

const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
};

class Login extends React.Component {
    constructor(props) {
        super(props);
        this.formRef = React.createRef()
        this.state = {
            loginVisible: false,
            ip: '',
            host:'',
            port: '',
            password: '',
            username: '',
            isShow: true
        }
    }

    onFinish = (values) => {
        if(values) {
            get('/api/dc/shell/v1/testConnShell', {
                addr: values.hostAddress,
                username: values.userName,
                password: values.password
            }).then(res => {
                console.log(res);
                if(res.code === 0) {
                    message.success('登录成功');
                    setTimeout(() => {
                        this.props.history.push({
                            pathname: '/ssh',
                            state: {
                                ip: values.hostAddress,
                                port: values.port,
                                userName: values.userName,
                                Password: values.password,
                            }
                        });
                        this.setState({
                            loginVisible: false
                        });
                        localStorage.setItem('userName', JSON.stringify(values));
                    }, 500)
                }else{
                    message.error(res.result);
                }
            })
        }
    };
      
    onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    onReset = () => {
        this.formRef.current.resetFields();
    };

    goTerminal = () => {
        this.props.history.push({
            pathname: '/ssh'
        });
        this.setState({
            isShow: false
        })
    }

    componentWillMount() {
        
    }
    componentDidMount() {
        if(this.props.location.search !== '') {
            let id = this.props.location.search.split('=').slice(-1)[0];
            post('/api/dc/hawkeye/host/v1/getServerAccount', {
                hostInfoId: '1870'
            }).then(res => {
                if(res.code === '0') {
                    this.setState({
                        host: res.data.publicIpAddress,
                        port: res.data.sshPort,
                        password: res.data.serverPassword,
                        username: res.data.serverAccount
                    })
                    get('/api/dc/shell/v1/testConnShell', {
                        addr: res.data.publicIpAddress,
                        username: res.data.serverAccount,
                        password: res.data.serverPassword
                    }).then(res => {
                        if(res.code === 0) {
                            message.success('登录成功');
                            setTimeout(() => {
                                this.props.history.push({
                                    pathname: '/ssh',
                                    state: {
                                        ip: this.state.host,
                                        port: this.state.port,
                                        userName:  this.state.username,
                                        Password:  this.state.password,
                                    }
                                });
                            }, 500)
                        }else{
                            message.error(res.result);
                        }
                    })
                }
            })
        }
        
    }

    render() {
        return(
            <div className="login-container">
                {/* {this.state.isShow ? <p onClick={this.goTerminal} className="ip-text">{this.state.ip}</p> : null} */}
                <Modal footer={null} maskClosable={false} title="登录" width="30%" visible={this.state.loginVisible}>
                    <Form
                        {...layout}                                  
                        ref={this.formRef}
                        labelAlign="left"
                        name="basic"
                        initialValues={{ remember: true }}
                        onFinish={this.onFinish}
                        onFinishFailed={this.onFinishFailed}
                        >
                        <Form.Item
                            label="主机地址"
                            name="hostAddress"
                            rules={[{ required: true, message: '请输入主机!' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            label="端口"
                            name="port"
                            rules={[{ required: true, message: '请输入端口!' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            label="用户名"
                            name="userName"
                            rules={[{ required: true, message: '请输入用户名!' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            label="密码"
                            name="password"
                            rules={[{ required: true, message: '请输入密码!' }]}
                        >
                            <Input.Password />
                        </Form.Item>

                        <Form.Item label=" ">
                            <Button type="primary" htmlType="submit">
                            确认
                            </Button>&nbsp;&nbsp;&nbsp;&nbsp;
                            <Button onClick={this.onReset}>
                            重置
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        )
    }
}

export default Login;
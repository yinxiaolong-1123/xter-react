
import React from 'react';
import { Drawer, Button, Row, Col, Modal, Layout, Menu, Tabs, Input } from 'antd';
import 'xterm/css/xterm.css';
import './index.css'
import CompactPicker from 'react-color';
import FileMessage from '../../component/FileManager/index';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import Stomp from 'stompjs'
import SockJS from 'sockjs-client';
import { UploadOutlined, UserOutlined, VideoCameraOutlined, FolderOpenOutlined } from '@ant-design/icons';
import { postFile, postPass } from '../../api/request'; // 请求方法
const { Content, Sider } = Layout;
const { TabPane } = Tabs;

class WebSSh extends React.Component {
    constructor(props) {
        super(props);
        this.host = '' // shell主机地址
        this.port = '' // shell端口号默认22
        this.password = '' // shell 密码
        this.username = ''  //shell登录人
        this.logingUserName = 'XiuEr' // 当前网页登录人
        this.token = "8c21576b52b845478b4bd159ee217b75"+new Date().getTime().toString();
        localStorage.setItem('shell_token', this.token);
        this.SOCKET_ENDPOINT = "http://avengers-do01.ovopark.com/mydlq?authenticator="+this.token; // 这边的地址不可以填写域名,请填写ip
        this.SUBSCRIBE_PREFIX = "/user/topic";
        this.SUBSCRIBE = "/user/topic";
        this.SEND_ENDPOINT = "/app/test";
        this.temporaryUser ='';
        this.newTabIndex = 0;
        this.state = {
            visible: false,
            settingVisible: false,
            terminalHeight: 100,
            fileList: [], // 文件浏览列表
            activeKey: '1',
            color: '#000',
            bgColor: '推荐皮肤',
            isColor: true,
            panes: [
                {
                    title: this.host, content: this.password, key: '1'
                }
            ],
            isFile: false,
            flag: 'bg',
            // 皮肤
            skin: '#000',
            // 列表
            skinList: [
                {
                    name: '红',
                    color: 'red',
                    id: 1
                },
                {
                    name: '蓝',
                    color: 'blue',
                    id: 2
                },
                {
                    name: '绿',
                    color: 'green',
                    id: 3
                },
                {
                    name: '黑',
                    color: '#000',
                    id: 4
                },
                {
                    name: '紫',
                    color: 'pink',
                    id: 5
                },
            ]
        }
    };
    /**
     * 文件管理按钮
     */
    fileBtn =() => {
        this.setState({
            visible: true,
        });
    }

    /**
     * 请求文件列表--浏览
     */
     fileListData =() => {
        let formdata = new FormData();
        formdata.append('operation', 1);
        formdata.append('target', '/');
        formdata.append('temporaryUser', this.state.temporaryUser);
        postFile('/api/dc/shell/v1/sftpClient', formdata).then(res => {
            if(res.code === 0) {
                this.setState({
                    fileList: res.data,
                    isFile: true
                });
            }else{
                this.setState({
                    fileList: [],
                });
            }
        })
    }

    /**
     * 设置
     */
    settingBtn = () => {
        this.setState({
            settingVisible: true,
        });
    }

    /**
     * 确认设置
     */
    handleOkSetting = () => {
        this.setState({
            settingVisible: false,
        });
        if(this.state.flag === 'bg') {
            localStorage.setItem('background', this.state.color);
        }else if(this.state.flag === 'font') {
            localStorage.setItem('font', this.state.color);
        }else if(this.state.flag === 'fontSize') {
            localStorage.setItem('fontSize', this.state.color);
        }
        window.location.reload();
    }

    /**
     * 取消设置
     */
    handleCancelSetting = () => {
        this.setState({
            settingVisible: false,
        });
    }

    /**
     * 文件管理关闭按钮
     */
    onClose = () => {
        this.setState({
            visible: false,
        });
    };

    /**
     * 皮肤
     */
    selectSkin = () => {
        this.setState({
            bgColor: '推荐皮肤',
            isColor: true,
            skinList: [
                {
                    name: '红',
                    color: 'red',
                    id: 1
                },
                {
                    name: '蓝',
                    color: 'blue',
                    id: 2
                },
                {
                    name: '绿',
                    color: 'green',
                    id: 3
                },
                {
                    name: '黑',
                    color: '#000',
                    id: 4
                },
                {
                    name: '紫',
                    color: 'pink',
                    id: 5
                },
            ],
            flag: 'bg'
        })
    }

    handleColorChange = (colorCode) => {    
        this.setState({ 
            color: colorCode.hex  
        })
    }

    /**
     * 字体
     */
    selectFont = () => {
        this.setState({
            bgColor: '推荐字体',
            isColor: false,
            skinList: [
                {
                    name: '宋体',
                    color: '宋体',
                    id: 1
                },
                {
                    name: '黑体',
                    color: '黑体',
                    id: 2
                },
                {
                    name: '微软雅黑',
                    color: '微软雅黑',
                    id: 3
                },
                {
                    name: '。。。',
                    color: '',
                    id: 4
                }
            ],
            flag: 'fontSize'
        })
    }

    /**
     * 字体大小
     */
     fontSize = () => {
        this.setState({
            bgColor: '推荐字体大小',
            isColor: false,
            skinList: [
                {
                    name: '12',
                    color: 12,
                    id: 1
                },
                {
                    name: '16',
                    color: 16,
                    id: 2
                },
                {
                    name: '20',
                    color: 20,
                    id: 3
                },
            ],
            flag: 'fontSize'
        })
    };

    /**
     * 选择字体或者皮肤
     */
    selectFontOrBg = (skin) => {
        this.setState({
            color: skin.color
        })
    };

    componentWillMount() {
        let tHeight = document.documentElement.clientHeight;
        this.setState({
            terminalHeight: tHeight - 70
        })
        document.getElementById('terminal');
    }

    componentWillUnmount () {
        this.setState = ()=>{
          return;
        };
    }

    componentDidMount() {

        let term = new Terminal({
            cursorBlink: true,
            theme: {
                foreground: localStorage.getItem('font'), // 字体
                background: localStorage.getItem('background'), // 背景色
                fontSize: localStorage.getItem('fontSize'),
                cursor: 'help', // 设置光标
                fastScrollModifier: 'ctrl',
            }
        });
        const SUBSCRIBE = this.SUBSCRIBE;
        const SEND_ENDPOINT = this.SEND_ENDPOINT;
        const SUBSCRIBE_PREFIX = this.SUBSCRIBE_PREFIX;
        const token = this.token
        // 1. 初始化stomp连接
        const sock = new SockJS(this.SOCKET_ENDPOINT);
        // 配置 STOMP 客户端
        const stompClient = Stomp.over(sock);
        this.stompClient = stompClient;
        // // STOMP 客户端连接
        // let headers = {
        //     host: this.host,
        //     login: this.username,
        //     passcode: this.password,

        //     // additional header
        //     // 'client-id': 'my-client-id'
        //     authenticator: token   //传token
        // };
        
        const fitPlugin = new FitAddon();
        term.open(document.getElementById('terminal'), true);

        term.loadAddon(fitPlugin);
        fitPlugin.fit();

        term.onResize(({cols, rows}) => {
          console.log(cols, rows);
        });


        window.onresize = () => fitPlugin.fit()
        if(this.props.location.search !== '') {
            let id = this.props.location.search.split('=').slice(-1)[0];
            postPass('/api/dc/hawkeye/host/v1/getServerAccount', {
                hostInfoId: id
            }).then(res => {
                if(res.code === '0') {
                    this.host = res.data.publicIpAddress;
                    this.port = res.data.sshPort;
                    this.password = res.data.serverPassword;
                    this.username = res.data.serverAccount;
                    this.setState({
                        panes: [
                            {
                                title: res.data.publicIpAddress, content: res.data.serverAccount, key: '1'
                            }
                        ],
                    })

                    // STOMP 客户端连接
                    let headers = {
                        host: this.host,
                        login: this.username,
                        passcode: this.password,

                        // additional header
                        // 'client-id': 'my-client-id'
                        authenticator: token   //传token
                    };
                    stompClient.connect(headers,
                        (frame)=> { // 成功连接
                            // 连接成功时（服务器响应 CONNECTED 帧）的回调方法
                            let temporaryUser = frame.headers['user-name']
                            console.log('【已连接】获取临时身份 --- > ' +temporaryUser );
                            this.setState({
                                temporaryUser: temporaryUser
                            },() => {
                                setTimeout(() => {
                                    this.fileListData();
                                }, 1000)
                            })
                            term.write('WellCome to Avengers ... host : '+this.host+' 😊    🌟  🌟  🌟  明天会更美好! 🌟  🌟  🌟\n \n \r');
                            console.log(SUBSCRIBE_PREFIX)
                            const subscribe = stompClient.subscribe(SUBSCRIBE_PREFIX, (response)=> {
                                console.log("订阅成功! 返回值 = " + response.body)
                                try{
                                    if(response.body!=='cd ~ && script -q -a'){
                                        console.log("true")
                                        term.write(response.body)
                                    }
                                }catch (e) {
                                    console.log(e)
                                    console.log("特殊字符解码失败!")
                                }
            
                            });
                            // 退订的方法
                            setTimeout(()=>{
                                // 发送shell 录制的命令
                                stompClient.send(SEND_ENDPOINT, {authenticator:token}, 'cd ~ && script -q -a'); // 发送录制
            
                            },1000)
                            setTimeout(()=>{
                                stompClient.send(SEND_ENDPOINT, {authenticator:token}, '\r') // 回车
                            },1500)
                        },
            
                        function errorCallBack (error) { // 连接失败
                            // 连接失败时（服务器响应 ERROR 帧）的回调方法
                            let myError=new Array(" *\n\r",
                                 " *                     .::::. 🌹\n\r"
                                ," *                  .::::::::.                                        🎫   Xiu Er\n\r"
                                ," *                 :::::::::::\n \r"
                                ," *             ..:::::::::::'                                         📧   13813641925@163.com\n\r"
                                ," *           '::::::::::::'\n\r"
                                ," *             .::::::::::                                            🐛   www.qiusunzuo.com\n\r"
                                ," *        '::::::::::::::..\n\r"
                                ," *             ..::::::::::::.                                        🌟   http://github.com/erdengzhazha\n\r"
                                ," *           ``::::::::::::::::\n\r"
                                ," *            ::::``:::::::::'        .:::.                           😄   Power By SpringBoot (v2.4.4)\n\r"
                                ," *           ::::'   ':::::'       .::::::::.\n\r"
                                ," *         .::::'      ::::     .:::::::'::::.\n\r"
                                ," *        .:::'       :::::  .:::::::::' ':::::.\n\r"
                                ," *       .::'        :::::.:::::::::'      ':::::.\n\r"
                                ," *      .::'         ::::::::::::::'         ``::::.\n\r"
                                ," *  ...:::           ::::::::::::'              ``::.\n\r"
                                ," * ```` ':.          ':::::::::'                  ::::..\n\r"
                                ," *                    '.:::::'                    ':'````..\n\r"
                                ," *"
                                )
                            for(let i=0;i<myError.length;i++){
                                term.write(myError[i]);
                            }
                            term.write("The cause of Err --> "+error)
                        }
                    );
                }
            })
        }
        
        function converBase64toBlob(content, contentType) {
            contentType = contentType || '';
            var sliceSize = 512;
            var byteCharacters = window.atob(content); //method which converts base64 to binary
            var byteArrays = [
            ];
            for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                var slice = byteCharacters.slice(offset, offset + sliceSize);
                var byteNumbers = new Array(slice.length);
                for (var i = 0; i < slice.length; i++) {
                    byteNumbers[i] = slice.charCodeAt(i);
                }
                var byteArray = new Uint8Array(byteNumbers);
                byteArrays.push(byteArray);
            }
            var blob = new Blob(byteArrays, {
                type: contentType
            }); //statement which creates the blob
            return blob;
        }

        // window.open(this.blobURL);
        let IllegalCharacter = 'rm' // 定义非法字符
        let orderIllegal = ''; // 记录非法字符

        term.onData((data)=> {
            // console.log("输入 === >" + data)
            // term.write(data);
            console.log('execute ,xterm.onData --->'+data)
            orderIllegal = orderIllegal + data // 记录
            console.log("记录值 --> "+ orderIllegal)
            if(orderIllegal.indexOf(IllegalCharacter)!=-1){ // 说明存在
                console.log("判断。。。。。")
                orderIllegal = ''; //清零
                term.write('包含非法字符 ---> '+IllegalCharacter);
                stompClient.send(SEND_ENDPOINT, {authenticator:token}, '\u0003'); // 发送消息 ctrl+c ，地址： http://note.youdao.com/s/abLXiCWT
                // stompClient.send(SEND_ENDPOINT,{}, '\u0003'); // 发送消息 ctrl+c ，地址： http://note.youdao.com/s/abLXiCWT

            }else{
                stompClient.send(SEND_ENDPOINT, {authenticator:token}, data); // 发送消息
                // stompClient.send(SEND_ENDPOINT,{}, data); // 发送消息
            }
        });

        // ********以下代码按键用******
        // if (term._initialized) {
        //     return
        // }
        // term._initialized = true;

        // term.prompt = () => {
        //     term.write('\r\n~$ '); // 换行
        // };
        // term.writeln('Welcome to xterm.js');
        // prompt(term);

        // function prompt(term) {
        //     term.write('\r\n~$ ');
        // }

        // term.onKey(e => {
        //     console.log(e);
        //     const ev = e.domEvent
        //     const printable = !ev.altKey && !ev.altGraphKey && !ev.ctrlKey && !ev.metaKey
        //     if (ev.keyCode === 13) { // enter键
        //         term.prompt()
        //     } else if (ev.keyCode === 8) { // back删除键
        //     // Do not delete the prompt
        //     if (term._core.buffer.x > 2) {
        //         term.write('\b \b')
        //     }
        //     } else if (printable) {
        //         term.write(e.key) // 同term.write(data); 但是中文输入不上去
        //     }
        // })
    

    }
    
    render() {
        return (
          <div>
              <div className="terminal-btn">
                <Row gutter={16}>
                    <Col className="gutter-row" span={12}>
                        <div className="setting-btn">
                            <FolderOpenOutlined />
                            <Tabs type="card">
                                {this.state.panes.map(pane => (
                                <TabPane tab={pane.title} key={pane.key} closable={pane.closable}>
                                    {pane.content}
                                </TabPane>
                                ))}
                            </Tabs>
                        </div>
                    </Col>
                    <Col className="gutter-row" span={12}>
                        <div className="file-btn">
                            <Button onClick={this.settingBtn}>设置</Button>
                            {this.state.isFile ?  <Button onClick={this.fileBtn} type="primary">文件管理</Button> : ''}
                        </div>
                    </Col>
                </Row>
              </div>
              {/* 文件管理 */}
              <Drawer
                    title="文件管理器"
                    placement="right"
                    width="60%"
                    closable={true}
                    onClose={this.onClose}
                    visible={this.state.visible}
                >
                    <FileMessage fileList={this.state.fileList} temporaryUser={this.state.temporaryUser} />
                </Drawer>

              {/**终端 */}
              <div id="terminal" style={{height: this.state.terminalHeight + 'px'}}></div>

              {/**设置 */}
              <Modal cancelText="取消" okText="确认" title="设置" width="60%" visible={this.state.settingVisible} onOk={this.handleOkSetting} onCancel={this.handleCancelSetting}>
                <Layout>
                    <Sider style={{ background: '#fff' }}>
                        <div className="logo" />
                        <Menu mode="inline" defaultSelectedKeys={['1']}>
                            <Menu.Item key="1" icon={<UserOutlined />} onClick={this.selectSkin}>
                            皮肤
                            </Menu.Item>
                            <Menu.Item key="2" icon={<VideoCameraOutlined />} onClick={this.selectFont}>
                            字体
                            </Menu.Item>
                            <Menu.Item key="3" icon={<UploadOutlined />} onClick={this.fontSize}>
                            字体大小
                            </Menu.Item>
                        </Menu>
                    </Sider>
                    <Layout>
                        <Content style={{ margin: '10px' }}>
                            <Row>
                                <Col span={12}>
                                    <h3 style={{textAlign: 'center'}}>{this.state.bgColor}</h3>
                                    <div className="select-list">
                                        <ul>
                                            {this.state.skinList.map(item => {
                                                return <li onClick = {()=> this.selectFontOrBg(item)} key={item.id}>{item.name}</li>
                                            })}
                                        </ul>
                                    </div>
                                </Col>
                                <Col span={12}>
                                    {this.state.isColor === false ? '' :
                                        <div>
                                            {/* <h3>自定义皮肤</h3> */}
                                            {/* <Input style={{width: '225px'}}/> */}
                                            <CompactPicker color={this.state.color} onChange={this.handleColorChange} />
                                        </div>
                                    }
                                </Col>
                            </Row>
                        </Content>
                    </Layout>
                </Layout>
              </Modal>
          </div>
        );
    }
  }

  export default WebSSh;
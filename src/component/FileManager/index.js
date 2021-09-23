import React,{Component} from 'react';
import './index.css';
import { Upload, Button, Table, Space, Layout, Tree, message, Spin  } from 'antd';
import { UploadOutlined, VerticalAlignBottomOutlined, FolderOpenOutlined, FileUnknownOutlined, FileOutlined, DeleteOutlined } from '@ant-design/icons';
import { postFile,postFile2 } from '../../api/request'; // 请求方法
import { path } from '../../api/config';
import axios from 'axios';
const { Content, Sider } = Layout;


class fileMessage extends Component {
    /**
     *  构造方法
     * @param props
     */
    constructor(props) {
        super(props);
        // eslint-disable-next-line no-unused-expressions
        this.pathInput = '/',
        this.state = {
            visible: false,
            showIcon: true,
            showLine: true, 
            setShowLeafIcon: false,
            loading: false,
            temporaryUser: '',
            currentIndex: 'root',
            fileName: '/', // 文件名
            pathInput: this.pathInput,
            tableHeightRight: 100,
            tableHeightLeft: 100,
            treeData: [],
            columns: [
                {
                    title: '名称',
                    key: 'fileName',
                    ellipsis: true,
                    render: (text, record) => (
                        <Space>
                            {record.chmod.slice(0, 1) === 'd' ? <FolderOpenOutlined /> : <FileOutlined />}
                            <Button type="text">{record.fileName}</Button>
                        </Space>
                    ),
                },
                {
                    title: '大小',
                    key: 'size',
                    align: 'center',
                    width: 120,
                    render: (text, record) => (
                        <Space>
                            <Button type="text">{record.size + ' ' + 'byte'}</Button>
                        </Space>
                    ),
                },
                {
                    title: '修改时间',
                    dataIndex: 'lastUpdateDate',
                    key: 'lastUpdateDate',
                    align: 'center',
                    width: 130,
                    ellipsis: true,
                },
                {
                    title: '类型',
                    key: 'attribute',
                    align: 'center',
                    width: 110,
                    ellipsis: true,
                    render: (text, record) => (
                        <Space>
                            <Button type="text">{record.chmod.slice(0, 1) === 'd' ? '文件夹' : '文件'}</Button>
                        </Space>
                    ),
                },
                {
                    title: '操作',
                    align: 'center',
                    key: 'action',
                    render: (text, record) => (
                        <Space size="middle">
                            {record.chmod.slice(0, 1) === '-' ? <Button onClick={() => this.deleteFile(text, record)} type="danger" ><DeleteOutlined />删除</Button> : ''}
                            {record.chmod.slice(0, 1) === '-' ? <Button type="primary" onClick={() => this.down(text, record)} icon={<VerticalAlignBottomOutlined />}>下载</Button> : ''}
                        </Space>
                    ),
                },
            ],
            dataSource: []
        }
    };
    /**
     * 选择根节点
     */
    rootPath = () => {
        this.setState({
            loading: true,
            currentIndex: 'root',
            pathInput: '/'
        })
        let formdata = new FormData();
        formdata.append('operation', 1);
        formdata.append('target', '/');
        formdata.append('temporaryUser', this.state.temporaryUser);
        postFile('/api/dc/shell/v1/sftpClient', formdata).then(res => {
            if(res.code === 0) {
                let arr = [];
                res.data.forEach((item, index) => {
                    item['key'] = index;
                    item['path'] = '/' + item.fileName
                    if(item.chmod.slice(0,1) == 'd' || item.chmod.slice(0,1) == '-') {
                        arr.push(item)
                    }
                })
                this.setState({
                    dataSource: arr,
                    loading: false
                })
            }else{
                this.setState({
                    dataSource: [],
                    loading: false
                })
            }
        }).catch(error => {
            message.error(error);
        })
    }

    /**
     * 选择树节点
     */

    onSelect = (selectedKeys, info) => {
        this.setState({
            fileName: info.node.title,
            currentIndex: '',
            loading: true
        })
        let path = info.node.path;
        let pathInput = this.state.pathInput;
        // 更新现在的pathInput
        if(info.node.path==null){ // 没有设置过
            this.pathInput= pathInput+'/'+path
            this.setState({
                pathInput: this.pathInput
            })
        }else{ // 设置过了
            this.pathInput= path
            this.setState({
                pathInput: this.pathInput
            })
        }
        let formdata = new FormData();
        formdata.append('operation', 1);
        formdata.append('target', this.pathInput);
        formdata.append('temporaryUser', this.state.temporaryUser);
        postFile('/api/dc/shell/v1/sftpClient', formdata).then(res => {
            if(res.code === 0) {
                let updateList = [];
                res.data.forEach((ext, index) => {
                    if(ext.chmod.slice(0, 1) === 'd'){
                        updateList.push({
                            title: ext.fileName,
                            key: info.node.key + '-' + index,
                            chmod: ext.chmod,
                            group: ext.group,
                            size: ext.size,
                            who: ext.who,
                            lastUpdateDate: ext.lastUpdateDate,
                            childNum: ext.childNum,
                            icon: ext.chmod.slice(0, 1) === 'd' ? <FolderOpenOutlined /> : ext.chmod.slice(0, 1) === 'l' ? <FileUnknownOutlined /> : <FileOutlined />,
                            path: this.pathInput + "/" + ext.fileName,
                        })
                    }
                })
                this.setState({
                    treeData: this.updateTreeData(this.state.treeData, info.node.key, updateList),
                })
                let arr = [];
                res.data.forEach((item, index) => {
                    item['key'] = index;
                    item['path'] = this.pathInput + "/" + item.fileName;
                    if(item.chmod.slice(0,1) == 'd' || item.chmod.slice(0,1) == '-') {
                        arr.push(item)
                    }
                })
                this.setState({
                    dataSource: arr,
                    loading: false
                })
            }else{
                this.setState({
                    treeData: this.updateTreeData(this.state.treeData, info.node.key, [])
                })
            }
        }).catch(error => {
            message.error(error);
        })
    };

    /**
     * 上传回调
     */
     onChangeUp(file) {
         console.log('.151', file);
     }

    /**
     * 更新树节点
     */

    updateTreeData(list, key, children) {
        children.map(item => {
            item['icon'] = item.chmod.slice(0, 1) === 'd' ? <FolderOpenOutlined /> : item.chmod.slice(0, 1) === 'l' ? <FileUnknownOutlined /> : <FileOutlined />;
        })
        return list.map(node => {
            if (node.key === key) {
                return {
                    ...node,
                    children
                };
            }
            if (node.children) {
                return {
                    ...node,
                    children: this.updateTreeData(node.children, key, children),
                };
            }
            return node;
        });
    }

    /**
     * 删除文件
     */

    deleteFile (row) {
        let operation;
        // 处理特殊字符 '\'

        let str = row.path;
        let resultStr = '';
        let strArray =  str.split('\\')
        for(let i=0;i<strArray.length-1;i++){
            resultStr = resultStr +  strArray[i] + "\\\\" 
        }
        resultStr =  resultStr + strArray[strArray.length-1]
        
        if(row.chmod.slice(0, 1) === 'd') {
            operation = 5;
        }else if(row.chmod.slice(0, 1) === '-') {
            operation = 4;
        }else{
            operation = 4;
        }
        let formdata = new FormData();
        formdata.append('operation', operation);
        formdata.append('target', resultStr);
        formdata.append('temporaryUser', this.state.temporaryUser);
        postFile('/api/dc/shell/v1/sftpClient', formdata).then(res => {
            if(res.code === 0) {
                const dataSource = [...this.state.dataSource];
                this.setState({
                    dataSource: dataSource.filter(item => item.key !== row.key)
                });
            }else{
                return;
            }
        })
    }

    /**
     * 下载
     */
     down = (row) => {
        let formdata = new FormData();
        formdata.append('operation', 3);
        formdata.append('target', this.state.pathInput === '/' ? '/' + row.fileName : this.state.pathInput + '/' + row.fileName);
        formdata.append('temporaryUser', this.state.temporaryUser);

        postFile2('/api/dc/shell/v1/sftpClient', formdata).then(res => {
            let blob = new Blob([res], {type: 'application/force-download'});
            // 获取heads中的filename文件名
            let downloadElement = document.createElement('a');
            // 创建下载的链接
            let href = window.URL.createObjectURL(blob);
            downloadElement.href = href;
            // 下载后文件名
            downloadElement.download = row.fileName;
            document.body.appendChild(downloadElement);
            // 点击下载
            downloadElement.click();
            // 下载完成移除元素
            document.body.removeChild(downloadElement);
            // 释放掉blob对象
            window.URL.revokeObjectURL(href)
        })
        
     }

    /**
     * 页面挂载完成后的生命周期钩子函数
     */

    componentDidMount() {
        let tableHeightLeft = document.documentElement.clientHeight - 200;
        let tableHeightRight = document.documentElement.clientHeight - 260;
        this.setState({
            tableHeightRight,
            tableHeightLeft
        })
        let arr = [];
        console.log(this.props.temporaryUser)
        this.props.fileList.map((item, index) => {
            if(item.chmod.slice(0,1) == 'd'){
                arr.push({
                    title: item.fileName,
                    key: index,
                    chmod: item.chmod,
                    group: item.group,
                    size: item.size,
                    who: item.who,
                    lastUpdateDate: item.lastUpdateDate,
                    childNum: item.childNum,
                    icon: <FolderOpenOutlined />,
                    path: "/"+item.fileName,
                    children: []
                });
            }
        });
        this.setState({
            treeData: arr,
            temporaryUser: this.props.temporaryUser
        }, () => {
            this.rootPath();
        });
    }

    render() {
        return (
            <div>
                <div className="upload-file">
                    <span className="path-input">
                        {this.state.pathInput}
                    </span>
                    {/* <span className="down">
                        <Button type="primary" onClick={this.down} icon={<VerticalAlignBottomOutlined />}>下载文件</Button>
                    </span> */}
                    <Upload action= {path + '/api/dc/shell/v1/sftpClient'} maxCount={1} headers={{authenticator: localStorage.getItem('token')}} data={{operation: 2, target: this.state.pathInput+"/", temporaryUser: this.state.temporaryUser}} onChange={this.onChangeUp}>
                        <Button type="primary" icon={<UploadOutlined />}>上传文件</Button>
                    </Upload>
                    <div className="upload-file-content">
                        <Spin tip="Loading..." size="large" spinning={this.state.loading}>
                        <Layout>
                            <Sider style={{ background: '#fff', paddingTop: '10px', paddingBottom: '10px'}}>
                                <div style={{ height: this.state.tableHeightLeft + 'px', overflow: 'auto' }}>
                                    <p onClick={this.rootPath} className={this.state.currentIndex === 'root' ? "tree-root" : 'tree-root1'}>/</p>
                                    <Tree
                                        showLine={{showLeafIcon: this.state.setShowLeafIcon}}
                                        showIcon={this.state.showIcon}
                                        // defaultExpandedKeys={['0-0-0']}
                                        onSelect={this.onSelect}
                                        treeData={this.state.treeData}
                                    > 
                                    </Tree>
                                </div>
                            </Sider>
                            <Layout style={{ background: '#fff' }}>
                                <Content style={{ margin: '10px'}}>
                                    <Table dataSource={this.state.dataSource} columns={this.state.columns} pagination={false} scroll={{ y: this.state.tableHeightRight }}></Table>
                                </Content>
                            </Layout>
                        </Layout>
                        </Spin>
                    </div>
                </div>
            </div>
        );
    }
}

export default fileMessage;
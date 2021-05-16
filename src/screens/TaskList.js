import React, { Component } from 'react'
import {
    View,
    Text,
    ImageBackground,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Platform,
    Alert
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import moment from 'moment'
import commonStyles from '../commonStyles'
import 'moment/locale/pt-br'
import Icon from 'react-native-vector-icons/FontAwesome'

import todayImagem from '../../imgs/today.jpg'
import Task from '../components/Task'
import AddTask from './AddTask'

const initialState = {
    showDoneTasks: true,
    visibleTasks: [],
    showAddTask: false,
    tasks: []
}

export default class TaskList extends Component {

    state = {
       ...initialState
    }

    toggleFilter = () => {
        this.setState({ showDoneTasks: !this.state.showDoneTasks}, this.filterTasks)
    }

    toggleTask = taskId => {
        const tasks = [...this.state.tasks]
        tasks.forEach(task => {
            if (task.id === taskId) {
                task.doneAt = task.doneAt ? null : new Date() 
            }

        });

        this.setState({ tasks }, this.filterTasks)
    }

    componentDidMount = async () => {
        const stateString = await AsyncStorage.getItem('tasksState')
        const state = JSON.parse(stateString) || initialState
        this.setState(state, this.filterTasks)
    }

    filterTasks = () => {
        let visibleTasks = null
        if ( this.state.showDoneTasks ) {
            visibleTasks = [...this.state.tasks]
        } else  {
            const peding = task => task.doneAt === null
            visibleTasks = this.state.tasks.filter(peding)
        }
        this.setState({ visibleTasks })
        AsyncStorage.setItem('tasksState', JSON.stringify(this.state))

    }

    addTask = (newTask) => {
        if (!newTask.desc || !newTask.desc.trim()) {
            Alert.alert('Dados invalidos', 'Descrição não informada')
            return
        }

        const tasks = [...this.state.tasks]

        tasks.push({
            id: Math.random(),
            desc: newTask.desc,
            estimateAt: newTask.date,
            doneAt: null
        })

        this.setState({ tasks, showAddTask: false }, this.filterTasks)

    }

    deleteTask = id => {
        const tasks = this.state.tasks.filter(tasks => tasks.id !== id)
        this.setState({tasks}, this.filterTasks)
    }

    render() {

        const today = moment().locale('pt-br').format('ddd D [de] MMMM')

        return (
            <View style={styles.container}>
                <View style={styles.background}>
                    <AddTask 
                        isVisible={this.state.showAddTask} 
                        onCancel={() => this.setState({ showAddTask: false })}
                        onSave={this.addTask}
                    />
                    <ImageBackground 
                        source={todayImagem} 
                        style={styles.background}>
                        <View style={styles.iconBar}>
                            <TouchableOpacity onPress={this.toggleFilter}>
                                <Icon name={this.state.showDoneTasks ? 'eye' : 'eye-slash'} size={30} color={commonStyles.colors.secondary} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.titleBar}>
                            <Text style={styles.title}>Hoje</Text>
                            <Text style={styles.subTitle}>{today}</Text>
                        </View>
                    </ImageBackground>
                </View>
                <View style={styles.taskList}>
                    <FlatList 
                        data={this.state.visibleTasks}
                        keyExtractor={item => `${item.id}`}
                        renderItem={({item}) =>
                            <Task {...item} toggleTask={this.toggleTask} onDelete={this.deleteTask} />
                        } />
                </View>
                <TouchableOpacity style={styles.addButton} 
                    onPress={() => this.setState({showAddTask: true})}>
                    <Icon name="plus" size={30} color={commonStyles.colors.secondary} />
                </TouchableOpacity>
            </View>
        )
    }

}

const styles = StyleSheet.create({

    container:{ 
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'white'
    },
    background: {
        flex: 3,
    },
    taskList: {
        flex: 7
    },
    titleBar: {
        flex: 1,
        justifyContent: 'flex-end',
        // marginLeft: 40
    },
    title: {
        fontFamily: commonStyles.fontFamily,
        color: commonStyles.colors.secondary,
        fontSize: 50,
        marginLeft: 20,
        marginBottom: 20
    },
    subTitle: {
        fontFamily: commonStyles.fontFamily,
        color: commonStyles.colors.secondary,
        fontSize: 20,
        marginLeft: 20,
        marginBottom: 30 
    },
    iconBar: {
        flexDirection: 'row',
        marginHorizontal: 20,
        justifyContent: 'flex-end',
        marginTop: Platform.OS === 'ios' ? 40 : 20
    },
    addButton: {
        position: 'absolute',
        right: 30,
        bottom: 30,
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: commonStyles.colors.today,
        justifyContent: 'center',
        alignItems: 'center'
    }

})
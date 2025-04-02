import { useEffect, useState } from 'react'
import { Edit, Plus, Repeat, Settings } from 'react-feather'
import { Alert } from '../components/Alert/Alert'
import { Card, CardHeader } from '../components/Card/Card'
import { useParams } from 'react-router-dom'
import { API_URL } from '../config'
import { useModalContext } from '../contexts/ModalContext'
import { Button } from '../components/Button/Button'
import { useApi } from '../contexts/ApiContext'
import { HeaderDataProps } from '../components/Card/types'
import { TasksSettings, TaskType, TodoGroup } from '../components/Task/types'
import { Task } from '../components/Task/Task'
import { useTranslation } from '../contexts/TranslationContext'

export const Todos = () => {
	const [todoGroups, setTodoGroups] = useState<TodoGroup[]>([])
	const [tasks, setTasks] = useState<TaskType[] | null>(null)
	const [archivedTasks, setArchivedTasks] = useState<TaskType[] | null>(null)
	const [tasksSettings, setTasksSettings] = useState<TasksSettings | null>(null)
	const [activeGroup, setActiveGroup] = useState('')
	const [showArchive, setShowArchive] = useState(false)
	const { setActiveModal } = useModalContext()
	const { dashboardId } = useParams()
	const { fetchData } = useApi()
	const { t } = useTranslation()

	const visibleTasks = showArchive ? archivedTasks : tasks

	useEffect(() => {
		fetchTasksSettings()
	}, [])

	useEffect(() => {
		if (tasksSettings) {
			fetchTodoGroups()
			fetchTasks(activeGroup)
		}
	}, [tasksSettings])

	const fetchTasksSettings = async () => {
		const url = `${API_URL}dashboards/${dashboardId}/tasks-settings`
		const response = await fetchData<TasksSettings>(url)

		if (response.error) {
			console.error('Failed to fetch TasksSettings', response.status, response.error)
			return
		}

		if (response.data) {
			setTasksSettings(response.data)
		}
	}

	const fetchTodoGroups = async () => {
		const url = `${API_URL}dashboards/${dashboardId}/tasks-groups`
		const response = await fetchData<TodoGroup[]>(url)

		if (response.error) {
			console.error('Failed to fetch dashboard tasks group', response.status, response.error)
			setTodoGroups([])
			return
		}

		if (response.data) {
			setTodoGroups(response.data)
		}
	}

	const fetchTasks = async (id: string) => {
		if (!tasksSettings) {
			return
		}

		const url = `${API_URL}dashboards/${dashboardId}/tasks/${id}?sortBy=${tasksSettings.sortMethod}&order=${tasksSettings.sortDirection}`
		const response = await fetchData<TodoGroup>(url)

		setActiveGroup(id)

		if (response.error) {
			console.error('Failed to fetch tasks', response.status, response.error)
			setTasks([])
			setArchivedTasks([])
			return
		}

		if (response.data) {
			const data = response.data
			const now = new Date()
			const activeTasks = data.tasks.filter(t => !t.archived_at || new Date(t.archived_at) > now)
			const archiveTasks = data.tasks.filter(t => t.archived_at && new Date(t.archived_at) <= now)
			setTasks(activeTasks)
			setArchivedTasks(archiveTasks)
		}
	}

	const addGroup = async (name: string) => {
		const url = `${API_URL}dashboards/${dashboardId}/add-todo-group`
		const options = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ name, tasks: [] }),
		}

		const response = await fetchData<TodoGroup>(url, options)

		if (response.error) {
			console.error('Failed to add todo group', response.status, response.error)
			return
		}

		if (response.data) {
			const data: TodoGroup = response.data
			setTodoGroups(prevGroups => [...(prevGroups ?? []), data])
		}
	}

	const handleSetTasksSettings = async (settings: TasksSettings) => {
		const url = `${API_URL}dashboards/${dashboardId}/tasks-settings`
		const options = {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(settings),
		}

		const response = await fetchData<TasksSettings>(url, options)

		if (response.error) {
			console.error('Failed to update task settings', response.status, response.error)
			return
		}

		if (response.data) {
			setTasksSettings(response.data)
		}
	}

	const handleModifyTodoGroupCategory = () => {
		const fetchTasksAndTodos = async () => {
			await fetchTodoGroups()
			await fetchTasks('')
		}
		const modifyTodoGroupCategoryModal = {
			name: 'modifyTodoGroup',
			data: {
				action: addGroup,
				actionName: t('add_group'),
				fetchAction: fetchTasksAndTodos,
				groups: todoGroups,
			},
			title: t('modify_todo_groups'),
		}
		setActiveModal(modifyTodoGroupCategoryModal)
	}

	const headerActions = () => {
		const addTaskModal = {
			name: 'addTask',
			data: {
				action: () => fetchTasks(activeGroup),
				actionName: t('save_task'),
				initValue: activeGroup,
				groups: todoGroups,
			},
			title: t('add_task'),
		}
		const actionsArray: HeaderDataProps[] = [
			{
				action: () => setActiveModal(addTaskModal),
				icon: <Plus size={16} />,
				label: t('add_task'),
				btnVariant: 'primary',
				disabled: !todoGroups || todoGroups.length === 0,
			},
			{
				action: () => setShowArchive(prevState => !prevState),
				icon: <Repeat size={16} />,
				label: showArchive ? t('show_active_tasks') : t('show_archive_tasks'),
				btnVariant: 'white',
			},
		]
		if (tasksSettings) {
			const tasksSettingsModal = {
				name: 'tasksSettings',
				data: {
					action: handleSetTasksSettings,
					actionName: t('save_settings'),
					initValue: tasksSettings as TasksSettings,
				},
				title: t('tasks_settings'),
			}

			actionsArray.push({
				action: () => setActiveModal(tasksSettingsModal),
				icon: <Settings size={16} />,
				label: t('settings'),
				btnVariant: 'white',
			})
		}
		return actionsArray
	}

	return (
		<Card
			contentClass='!p-0'
			headerComponent={<CardHeader title={t('tasks_todo')} data={headerActions()}></CardHeader>}>
			<div className='flex border-t-0 flex-wrap min-h-[60px] items-center justify-between gap-2 bg-zinc-100 py-2 px-4 border-b border-zinc-300'>
				<div className='flex gap-3 overflow-x-auto'>
					<Button
						variant='text'
						onClick={() => fetchTasks('')}
						className={`flex-grow-0 flex-shrink-0 basis-auto !text-blue-500 !p-0 ${
							activeGroup === '' ? 'font-semibold' : ''
						}`}>
						{t('all_tasks')}
					</Button>
					{todoGroups &&
						todoGroups.length > 0 &&
						todoGroups.map(tdg => (
							<Button
								key={tdg._id}
								variant='text'
								className={`flex-grow-0 flex-shrink-0 basis-auto !text-blue-500 !px-0 !py-1 ${
									activeGroup === tdg._id ? 'font-semibold' : ''
								}`}
								onClick={() => fetchTasks(tdg._id)}>
								{tdg.name}
							</Button>
						))}
				</div>
				<Button variant='secondary' onClick={handleModifyTodoGroupCategory}>
					<Edit size={16} />
					{t('manage_groups')}
				</Button>
			</div>
			{showArchive && <div className='p-4 font-semibold border-b border-zinc-300'>{t('archived_tasks')}</div>}
			{visibleTasks && visibleTasks.length > 0 ? (
				<>
					<div className='flex flex-col rounded-b-2xl overflow-hidden'>
						{tasksSettings &&
							visibleTasks.map(t => (
								<Task
									key={t._id}
									task={t}
									fetchTasks={() => fetchTasks(activeGroup)}
									tasksSettings={tasksSettings}
									isArchive={showArchive}
								/>
							))}
					</div>
				</>
			) : (
				<>
					{!todoGroups ||
						(todoGroups.length === 0 ? (
							<Alert variant='primary'>{`${t('you_need_to_have_tasks_group')}`}</Alert>
						) : (
							<Alert variant='primary'>{`${t('list_of')} ${showArchive ? t('archived') : ''} ${t(
								'tasks_is_empty'
							)}.`}</Alert>
						))}
				</>
			)}
		</Card>
	)
}

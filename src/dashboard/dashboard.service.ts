import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Team, TeamDocument, TeamTask, TeamMeeting } from '../teams/team.schema';
import { StudyGroup, StudyGroupDocument, StudyGroupMeeting, StudyGroupTask } from '../studyGroups/studyGroup.schema';
import { User, UserDocument } from '../users/user.schema';
import { Event, EventType } from '../events/event.schema';
import { addWeeks, startOfWeek, endOfWeek, setHours, setMinutes, parse, format } from 'date-fns';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Team.name) private teamModel: Model<TeamDocument>,
    @InjectModel(StudyGroup.name) private studyGroupModel: Model<StudyGroupDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Event.name) private eventModel: Model<Event>,
  ) {}

  private generateRecurringMeetings(studyGroup: StudyGroupDocument & { _id: Types.ObjectId }) {
    const recurringMeetings: any[] = [];
    const today = new Date();
    const weekStart = startOfWeek(today);
    const weekEnd = endOfWeek(addWeeks(today, 4)); // Generate for next 4 weeks

    // Handle both meetingTime and startTime/endTime cases
    let startHour = 0, startMinute = 0, endHour = 0, endMinute = 0;

    if (studyGroup.startTime && studyGroup.endTime) {
        [startHour, startMinute] = studyGroup.startTime.split(':').map(Number);
        [endHour, endMinute] = studyGroup.endTime.split(':').map(Number);
    } else if (studyGroup.meetingTime) {
        [startHour, startMinute] = studyGroup.meetingTime.split(':').map(Number);
        // If only meetingTime is provided, set end time to 1 hour later
        endHour = startHour + 1;
        endMinute = startMinute;
    } else {
        console.warn(`Study group ${studyGroup._id} has no valid meeting time`);
        return [];
    }

    const dayMap: { [key: string]: number } = {
        'Sunday': 0,
        'Monday': 1,
        'Tuesday': 2,
        'Wednesday': 3,
        'Thursday': 4,
        'Friday': 5,
        'Saturday': 6
    };

    studyGroup.meetingDays.forEach(day => {
        let currentDate = new Date(weekStart);
        currentDate.setDate(currentDate.getDate() + ((7 + dayMap[day] - currentDate.getDay()) % 7));

        while (currentDate <= weekEnd) {
            const meetingStart = new Date(currentDate);
            meetingStart.setHours(startHour, startMinute, 0);

            const meetingEnd = new Date(currentDate);
            meetingEnd.setHours(endHour, endMinute, 0);

            if (meetingEnd > today) { // Only include future meetings
                recurringMeetings.push({
                    id: `recurring-${studyGroup._id}-${format(meetingStart, 'yyyy-MM-dd')}`,
                    title: `${studyGroup.name} - Regular Meeting`,
                    description: `Regular study group meeting for ${studyGroup.name}`,
                    startDate: meetingStart,
                    endDate: meetingEnd,
                    location: studyGroup.meetingLocation,
                    source: 'study-group' as const,
                    sourceId: studyGroup._id.toString(),
                    sourceName: studyGroup.name,
                    type: 'recurring',
                    isRecurring: true
                });
            }

            currentDate.setDate(currentDate.getDate() + 7); // Move to next week
        }
    });

    return recurringMeetings;
  }

  async getDashboardData(userId: string) {
    try {
      console.log('Fetching dashboard data for user:', userId);

      // Get user's teams with populated data
      const teams = await this.teamModel.find({
        'members.userId': userId
      })
      .populate('createdBy', 'firstname lastname email profilePicture')
      .populate('members.userId', 'firstname lastname email profilePicture')
      .populate({
        path: 'tasks.assignedTo',
        select: 'firstname lastname email profilePicture'
      })
      .populate({
        path: 'meetings.createdBy',
        select: 'firstname lastname email profilePicture'
      })
      .lean() as unknown as (TeamDocument & { _id: Types.ObjectId })[];

      console.log('Found teams:', teams.length);

      // Get user's study groups with populated data
      const studyGroups = await this.studyGroupModel.find({
        'members.userId': userId
      })
      .populate('createdBy', 'firstname lastname email profilePicture')
      .populate('members.userId', 'firstname lastname email profilePicture')
      .populate({
        path: 'tasks',
        populate: {
          path: 'assignedTo createdBy',
          select: 'firstname lastname email profilePicture'
        }
      })
      .populate({
        path: 'meetings',
        populate: {
          path: 'createdBy',
          select: 'firstname lastname email profilePicture'
        }
      })
      .lean() as unknown as (StudyGroupDocument & { _id: Types.ObjectId })[];

      console.log('Found study groups:', studyGroups.length);

      // Get user data
      const user = await this.userModel.findById(userId).lean() as unknown as (UserDocument & { _id: Types.ObjectId }) | null;
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Get user's personal events
      const personalEvents = await this.eventModel.find({
        owner: userId,
        source: 'personal'
      }).lean();

      console.log('Found personal events:', personalEvents.length);

      // Extract and format team tasks
      const teamTasks = teams.flatMap(team => (team.tasks || []).map((task: TeamTask) => ({
        id: task._id.toString(),
        title: task.title,
        description: task.description || '',
        dueDate: task.dueDate,
        completed: task.status === 'completed',
        status: task.status,
        source: 'team' as const,
        sourceId: team._id.toString(),
        sourceName: team.name,
        assignedTo: task.assignedTo || []
      })));

      // Extract and format study group tasks
      const studyGroupTasks = studyGroups.flatMap(group => (group.tasks || []).map((task: StudyGroupTask) => ({
        id: task._id.toString(),
        title: task.title,
        description: task.description || '',
        dueDate: task.dueDate,
        completed: task.status === 'completed',
        status: task.status,
        source: 'study-group' as const,
        sourceId: group._id.toString(),
        sourceName: group.name,
        assignedTo: task.assignedTo || []
      })));

      // Extract and format team meetings
      const teamMeetings = teams.flatMap(team => (team.meetings || []).map((meeting: TeamMeeting) => ({
        id: meeting._id.toString(),
        title: meeting.title,
        description: meeting.description,
        startDate: meeting.startDate,
        endDate: meeting.endDate,
        location: meeting.location,
        source: 'team' as const,
        sourceId: team._id.toString(),
        sourceName: team.name,
        type: 'meeting',
        createdBy: meeting.createdBy
      })));

      // Generate recurring meetings for study groups
      const recurringMeetings = studyGroups.flatMap(group => this.generateRecurringMeetings(group));

      // Extract and format one-off study group meetings
      const studyGroupMeetings = studyGroups.flatMap(group => (group.meetings || []).map((meeting: StudyGroupMeeting) => ({
        id: meeting._id.toString(),
        title: meeting.title,
        description: meeting.description,
        startDate: meeting.startDate,
        endDate: meeting.endDate,
        location: meeting.location,
        source: 'study-group' as const,
        sourceId: group._id.toString(),
        sourceName: group.name,
        type: 'study',
        createdBy: meeting.createdBy,
        isRecurring: false
      })));

      // Format personal events
      const formattedPersonalEvents = personalEvents.map(event => ({
        id: event._id.toString(),
        title: event.title,
        description: event.description,
        startDate: event.startDate,
        endDate: event.endDate,
        type: event.type,
        source: 'personal' as const,
        sourceId: userId,
        completed: event.completed
      }));

      const result = {
        tasks: [...teamTasks, ...studyGroupTasks],
        events: [...teamMeetings, ...studyGroupMeetings, ...recurringMeetings, ...formattedPersonalEvents],
        teams,
        studyGroups
      };

      console.log('Dashboard data summary:', {
        totalTasks: result.tasks.length,
        totalEvents: result.events.length,
        teamCount: teams.length,
        studyGroupCount: studyGroups.length,
        studyGroupTaskCount: studyGroupTasks.length,
        studyGroupMeetingCount: studyGroupMeetings.length,
        recurringMeetingCount: recurringMeetings.length,
        personalEventCount: formattedPersonalEvents.length
      });

      return result;
    } catch (error) {
      console.error('Error in getDashboardData:', error);
      throw error;
    }
  }
} 
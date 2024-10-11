import { Controller, Post, Body, Get, Query, Param, Delete, Put, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { CreateStudyGroupDto } from './dto/createStudyGroup.dto';
import { StudyGroupService } from './studyGroup.service';
import { JwtAuthGuard } from 'src/auth/JwtAuthGuard';

@Controller("studyGroup")
export class StudyGroupController {
    constructor(private studyGroupService: StudyGroupService) {}

    @Post()
    createStudyGroup(@Body() createStudyGroupDto: CreateStudyGroupDto) {
        return this.studyGroupService.create(createStudyGroupDto);
    }

    @Put(':id')
    async updateStudyGroup(
        @Param('id') id: string,
        @Body() updateStudyGroupDto: CreateStudyGroupDto
    ) {
        return this.studyGroupService.update(id, updateStudyGroupDto);
    }

    @Get('all')
    getAllStudyGroups() {
        return this.studyGroupService.findAll();
    }

    @Get('search')
    searchStudyGroupByTitle(@Query('title') title: string) {
        return this.studyGroupService.searchByTitle(title);
    }

    // Move this route higher in the controller to ensure it's matched before the ':id' route
    @UseGuards(JwtAuthGuard)
    @Get('user')
    async getUserStudyGroups(@Query('userId') userId: string) {
        return this.studyGroupService.getUserStudyGroups(userId);
    }

    @Get(':id')
    getStudyGroupInformationByStudyGroupId(@Param('id') id: string) {
        return this.studyGroupService.getById(id);
    }

    @Delete(':id')
    deleteStudyGroup(@Param('id') id: string) {
        return this.studyGroupService.deleteById(id);
    }

    @Post(':id/join')
    async joinStudyGroup(
        @Param('id') id: string,
        @Body('userId') userId: string
    ) {
        try {
            const updatedGroup = await this.studyGroupService.joinGroup(id, userId);
            return { message: "Successfully joined the study group", group: updatedGroup };
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }
}
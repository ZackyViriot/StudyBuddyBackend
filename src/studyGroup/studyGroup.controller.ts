import {Controller,Post,Body,Get,Query,Param,Delete,Put,HttpException,HttpStatus} from '@nestjs/common';
import { CreateStudyGroupDto } from './dto/createStudyGroup.dto';
import { StudyGroupService } from './studyGroup.service';


@Controller("studyGroup")
export class StudyGroupController {
    constructor(private studyGroupService:StudyGroupService){}


    @Post(":id")
    createStudyGroup(@Body() createStudyGroupDto:CreateStudyGroupDto){
        return this.studyGroupService.create(createStudyGroupDto)
    }


    @Put(':id')
    async updateStudyGroup(
        @Param('id') id:string,
        @Body() updateStudyGroupDto:CreateStudyGroupDto
    ){
        return this.studyGroupService.update(id,updateStudyGroupDto)
    }


    @Get('all')
    getAllStudyGroups(){
        return this.studyGroupService.findAll();
    }
    // could be potential problem with title might have to be change to name
    @Get('search')
    searchStudyGroupByTitle(@Query('title') title:string){
        return this.studyGroupService.searchByTitle(title);
    }

    @Get('getUserStudyGroups')
    getStudyGroupsByUserId(@Query('userId') userId:string){
        return this.studyGroupService.getByUserId(userId)
    }

    @Get(':id')
    getStudyGroupInformationByStudyGroupId(@Param('id') id:string){
        return this.studyGroupService.getById(id);
    }

    @Delete(':id')
    deleteStudyGroup(@Param('id') id:string){
        return this.studyGroupService.deleteById(id);
    }


}
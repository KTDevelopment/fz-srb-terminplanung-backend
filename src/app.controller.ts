import {Controller, Get, HttpCode, HttpStatus, Redirect} from '@nestjs/common';
import {ApiResponse, ApiTags} from "@nestjs/swagger";

@ApiTags('redirects')
@Controller()
export class AppController {

    @ApiResponse({status: HttpStatus.SEE_OTHER, description: "redirect to: /documentation"})
    @Get()
    @Redirect('/documentation', HttpStatus.SEE_OTHER)
    @HttpCode(HttpStatus.SEE_OTHER)
    documentationLink() {
        return;
    }

    @ApiResponse({status: HttpStatus.SEE_OTHER, description: "redirect to: /admin#/termsAndConditions"})
    @Get('/termsAndConditions')
    @Redirect('/admin#/termsAndConditions', HttpStatus.SEE_OTHER)
    @HttpCode(HttpStatus.SEE_OTHER)
    redirectTermsAndConditions() {
        return;
    }

    @ApiResponse({status: HttpStatus.SEE_OTHER, description: "redirect to: /admin#/privacyPolicy"})
    @Get('/privacyPolicy')
    @Redirect('/admin#/privacyPolicy', HttpStatus.SEE_OTHER)
    @HttpCode(HttpStatus.SEE_OTHER)
    redirectPrivacyPolicy() {
        return;
    }

    @ApiResponse({status: HttpStatus.SEE_OTHER, description: "redirect to: /admin#/contact"})
    @Get('/contact')
    @Redirect('/admin#/contact', HttpStatus.SEE_OTHER)
    @HttpCode(HttpStatus.SEE_OTHER)
    redirectContact() {
        return;
    }
}

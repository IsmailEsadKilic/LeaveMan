import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'searchUser'
})
export class SearchUserPipe implements PipeTransform {

  transform(value: any[], args?: string): any[] {
    if (!args) {
      return value;
    }
    return value.filter(user =>
      user.userName.toLowerCase().includes(args.toLowerCase()))

  }

}

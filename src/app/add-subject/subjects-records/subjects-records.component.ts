import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Student } from 'src/app/shared/student.interface';
import { ComponentCommunication } from '../../shared/ComponentCommunication.service';
import { Subject } from '../Subject.interface';
import {serverOptions} from '../../shared/server.option';

@Component({
  selector: 'app-subjects-records',
  templateUrl: './subjects-records.component.html',
  styleUrls: ['./subjects-records.component.css'],
})
export class SubjectsRecordsComponent implements OnInit, OnDestroy {
  subscription: Subscription;

  Subjects: Subject[]; // should be fetched from the database later

  constructor(
    private sendMsg: ComponentCommunication,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.http
      .get<Subject[]>(serverOptions.serverUrl + '/add-subject', {
        responseType: 'json',
        observe: 'response',
      })
      .subscribe((res) => {
        if (!res.ok) {
          alert('Some Internal error occured when requesting the Subjects');
        } else {
          if (res.body) {
            this.Subjects = res.body;
          }
        }
      });
    this.subscription = this.sendMsg.addSubjectMsg.subscribe((message) => {
      // message received
      if (!message) {
        return;
      }
      this.http
        .post<Subject>(serverOptions.serverUrl + '/add-subject', message, {
          responseType: 'json',
          observe: 'response',
        })
        .subscribe((res) => {
          if (res.body) {
            this.Subjects.unshift(message); // should be inserted in the database then fetch the results again
            //console.log(this.Subjects); // Debug :)
            this.sendMsg.SendAddSubjectMsg(null);
          } else {
            alert(
              "Error Occured, Please check that you havn't already inserted the same subject before"
            );
            this.sendMsg.SendAddSubjectMsg(null);
          }
        });
    });
  }

  deleteSubject(index , year, classCode, subjectCode) {
    console.log(year, classCode, subjectCode);
    this.http
      .delete(serverOptions.serverUrl + '/add-subject', {
        responseType: 'json',
        observe: 'response',
        params: {
          year: year,
          classCode: classCode,
          subjectCode: subjectCode,
        },
      })
      .subscribe((res) => {
        console.log(res);
        if(res.body){
            this.Subjects.splice(index , 1);
        }
        else {
          alert('Internal error occured please try again.')
        }
      });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}

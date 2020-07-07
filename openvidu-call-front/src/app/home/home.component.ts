import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';

import { HttpClient } from '@angular/common/http';
import { StorageService } from '../shared/services/storage/storage.service';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
	//public roomForm: FormControl;
	public version = require('../../../package.json').version;

	loginForm: FormGroup;
	submitted = false;
	invalidCreds = false;

	classes = [];
	users = [];

	userClasses = [];

	loading = false;

	constructor(
		private router: Router, 
		public formBuilder: FormBuilder, 
		private storageService: StorageService,
		private http: HttpClient) {}

	ngOnInit() {

		//const randomName = uniqueNamesGenerator({ dictionaries: [adjectives, colors, animals], separator: '-', });
		// this.roomForm = new FormControl(
		// 	randomName, [Validators.minLength(4), Validators.required]
		// 	);
		this.loading = true;
		this.http.get('https://api.npoint.io/e5905c5981a5cc5a1067')
		.subscribe(res => {
			this.classes = (res as any).classes;
			this.users = (res as any).users;
			this.loading = false;
			if(this.isLoggedIn()) {
				const user = this.storageService.get('user');
				user.classes.forEach(c => {
					console.log(this.classes.find(c1 => c1.id == c));
					this.userClasses.push(this.classes.find(c1 => c1.id == c));
				});
			}
		});
		this.loginForm = this.formBuilder.group({
			username: ['', Validators.required],
			password: ['', Validators.required],
		});
	}

	public goToVideoCall() {
		/*if (this.roomForm.valid) {
			const roomName = this.roomForm.value.replace(/ /g, '-'); // replace white spaces by -
			this.roomForm.setValue(roomName);
			this.router.navigate(['/', roomName]);
		}*/
	}

	goToRoom(roomId: string) {
		this.router.navigate(['/', roomId]);
	}

	get f() { return this.loginForm.controls; }
	login() {
		this.invalidCreds = false;
		this.submitted = true;
		if(this.loginForm.invalid) {
			return;
		}
		const username = this.f.username.value;
		const password = this.f.password.value;
		const user = this.users.find(u => u.username === username && u.password === password);
		if(!user) {
			this.invalidCreds = true;
		} else {
			this.storageService.set('user', user);
			this.storageService.set('openviduCallNickname', user.username);
			user.classes.forEach(c => {
				console.log(this.classes.find(c1 => c1.id == c));
				this.userClasses.push(this.classes.find(c1 => c1.id == c));
			});
			console.log(this.userClasses);
		}
	}

	isLoggedIn() {
		return !!this.storageService.get('user');
	}

	logout() {
		console.log('logging out');
		this.storageService.clear();
		this.userClasses = [];
	}
}

import * as vscode from 'vscode';

class MyComment implements vscode.Comment {
	static count: number = 0;
	lastPublished: string | vscode.MarkdownString = '';

	constructor( private readonly thread: vscode.CommentThread,
		public author: vscode.CommentAuthorInformation,
		public body: string | vscode.MarkdownString = '',
		public mode: vscode.CommentMode = vscode.CommentMode.Preview,
		public contextValue?: string,
		public reactions?: vscode.CommentReaction[],
		public label?: string,
	) {}

	private updateThread() {
		this.thread.comments = this.thread.comments;
	}

	startEdit() {
		this.lastPublished = this.body;
		this.mode = vscode.CommentMode.Editing;
		this.updateThread();
	}

	applyEdit() {
		this.lastPublished = '';
		this.mode = vscode.CommentMode.Preview;
		this.updateThread();
	}

	cancelEdit() {
		this.body = this.lastPublished;
		this.lastPublished = '';
		this.mode = vscode.CommentMode.Preview;
		this.updateThread();
	}

	removeFromThread() {
		this.thread.comments = this.thread.comments.filter( comment => comment !== this );
	}
}

export function activate(context: vscode.ExtensionContext) {
	const commentController = vscode.comments.createCommentController( 'SampleCommentController', 'Sample Comments' );
	
	// create comment on current selection
	let disposable = vscode.commands.registerCommand('create.commentThread', () => {
		const uri = vscode.window.activeTextEditor?.document.uri;
    const selected = vscode.window.activeTextEditor?.selection;

    if( uri && selected ) {
			const thread = commentController.createCommentThread( uri, selected, [] );
			thread.collapsibleState = vscode.CommentThreadCollapsibleState.Expanded;
    }
	} );

	vscode.commands.registerCommand('remove.commentThread', ( thread: vscode.CommentThread ) => {
		if( !thread ) {
			return;
		}
		thread.dispose();
	}, disposable );

  vscode.commands.registerCommand( 'reply.commentThread', ( reply: vscode.CommentReply ) => {
		if( !reply ) {
			return;
		}
		reply.thread.comments = reply.thread.comments.concat( new MyComment( reply.thread, { name: 'Anonymous' }, reply.text ) );
	}, disposable );

  vscode.commands.registerCommand( 'start.edit.comment', ( comment: MyComment ) => {
		if( !comment ) {
			return;
		}
		comment.startEdit();
	}, disposable );

  vscode.commands.registerCommand( 'apply.edit.comment', ( comment: MyComment ) => {
		if( !comment ) {
			return;
		}
		comment.applyEdit();
	}, disposable );
	
  vscode.commands.registerCommand( 'cancel.edit.comment', ( comment: MyComment ) => {
		if( !comment ) {
			return;
		}
		comment.cancelEdit();
	}, disposable );
	
  vscode.commands.registerCommand( 'remove.comment', ( comment: MyComment ) => {
		if( !comment ) {
			return;
		}
		comment.removeFromThread();
	}, disposable );

	context.subscriptions.push(disposable);
}

export function deactivate() {}

(function (wp) {
	const { useEffect } = wp.element;
	const { registerPlugin } = wp.plugins;

	const TrashInterceptor = () => {
		useEffect(() => {
			console.log('TrashInterceptor useEffect');
			const observer = new MutationObserver((mutations) => {
				mutations.forEach((mutation) => {
					const trashButton = document.querySelector('.editor-post-trash.components-button');

					if (trashButton) {
						console.log('Trash button found');
						const originalClickHandler = trashButton.onclick;

						trashButton.onclick = function (event) {
							console.log('Trash button clicked');
							event.preventDefault();
							event.stopPropagation();

							const editor = wp.data.select('core/editor');
							const postId = editor.getCurrentPostId();

							console.log('Checking post links for Post ID:', postId);
							checkPostLinks(postId, originalClickHandler);
						};

						// Disconnect observer once the trash button is found and modified
						observer.disconnect();
					}
				});
			});

			// Observe changes in the document
			observer.observe(document, { childList: true, subtree: true });
		}, []);

		return null;
	};

	function checkPostLinks(postId, originalClickHandler) {
		jQuery.ajax({
			type: 'POST',
			url: vlpbt_data.ajax_url,
			data: {
				action: 'vlpbt_check_linked_posts',
				post_id: postId,
			},
			success(response) {
				const linkedPosts = JSON.parse(response);

				if (linkedPosts.length > 0) {
					let message = '<p>There are posts that link to this post:</p><ul>';
					linkedPosts.forEach(function (post) {
						message += `<li><a href="${vlpbt_data.ajax_url.replace(
							'admin-ajax.php',
							'post.php',
						)}?post=${post.ID}&action=edit" target="_blank">${post.title} (ID: ${
							post.ID
						}, Post Type: ${post.post_type})</a></li>`;
					});
					message += '</ul><p>Do you want to continue with the trash action?</p>';


					Swal.fire({
						title: 'Warning',
						html: message,
						icon: 'warning',
						showCancelButton: true,
						confirmButtonText: 'Yes, trash it!',
						cancelButtonText: 'No, cancel',
						customClass: {
							container: 'wp-swal-container',
							title: 'wp-swal-title',
							content: 'wp-swal-content',
							actions: 'wp-swal-actions',
							confirmButton: 'wp-swal-confirm-button',
							cancelButton: 'wp-swal-cancel-button',
						},
					}).then((result) => {
						if (result.isConfirmed) {
							originalClickHandler();
						}
					});
				} else {
					originalClickHandler();
				}
			},
			error(jqXHR, textStatus, errorThrown) {
				console.log('AJAX error:', textStatus, errorThrown);
			},
		});
	}

	registerPlugin('trash-interceptor', {
		render: TrashInterceptor,
	});
})(window.wp);
